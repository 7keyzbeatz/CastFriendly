<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

define('ADMIN_ROOT', dirname(__DIR__));
define('DATA_FILE', ADMIN_ROOT . '/data/brands.json');
define('UPLOAD_ROOT', ADMIN_ROOT . '/uploads');
define('LOGO_DIR', UPLOAD_ROOT . '/logos');
define('BG_DIR', UPLOAD_ROOT . '/backgrounds');

/* ================= LOAD / SAVE ================= */

function loadBrands(): array
{
    if (!file_exists(DATA_FILE)) {
        return ['meta' => [], 'brands' => []];
    }
    $raw = preg_replace('/^\xEF\xBB\xBF/', '', file_get_contents(DATA_FILE));
    $json = json_decode($raw, true);
    return is_array($json) ? $json : ['meta' => [], 'brands' => []];
}

function saveBrands(array $data, bool $bumpVersion = true): void
{
    // last updated πάντα
    $data['meta']['lastUpdated'] = date('Y-m-d H:i:s');

    // version bump μόνο αν το ζητήσουμε
    if ($bumpVersion) {
        $current = $data['meta']['version'] ?? '1.0';

        // split 1.2 -> [1,2]
        [$major, $minor] = array_pad(
            array_map('intval', explode('.', $current)),
            2,
            0
        );

        $minor++;
        $data['meta']['version'] = $major . '.' . $minor;
    }

    file_put_contents(
        DATA_FILE,
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
}

/* ================= HELPERS ================= */

function slugify(string $name): string
{
    return strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $name), '-'));
}

function uploadImage(?array $file, string $dir): ?string
{
    if (!$file || $file['error'] !== UPLOAD_ERR_OK)
        return null;
    if (!is_dir($dir))
        mkdir($dir, 0777, true);

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['png', 'jpg', 'jpeg', 'webp']))
        return null;

    $name = uniqid('img_', true) . '.' . $ext;
    move_uploaded_file($file['tmp_name'], $dir . '/' . $name);

    return '/admin/uploads/' . basename($dir) . '/' . $name;
}

function getBrandById(string $id): ?array
{
    $data = loadBrands();
    foreach ($data['brands'] as $b) {
        if ($b['id'] === $id)
            return $b;
    }
    return null;
}

function emptyBrand(): array
{
    return [
        'id' => '',
        'name' => '',
        'description' => '',
        'media' => ['logo' => '', 'background' => null],
        'company' => ['owner' => '', 'established' => ''],
        'licenses' => [],
        'features' => [
            'vpnFriendly' => false,
            'languages' => [],
            'liveChat' => []
        ],
        'bonus' => [
            'percentage' => null,
            'percentageUpTo' => false,

            'maxAmount' => null,
            'maxAmountUpTo' => false,

            'freeSpins' => null,
            'freeSpinsUpTo' => false,

            'wager' => null,

            'exclusive' => null
        ],
        'withdrawals' => [
            'perDay' => null,
            'perWeek' => null,
            'perMonth' => null
        ],
        'links' => ['claimOffer' => '']
    ];
}

function buildBrandFromPost(array $post, array $files, array $meta): array
{
    /* ================= MEDIA ================= */

    $logo =
        uploadImage($files['logo_file'] ?? null, LOGO_DIR)
        ?? ($post['logo_url'] ?? null);

    if (!$logo) {
        die('Logo required');
    }

    $background =
        uploadImage($files['bg_file'] ?? null, BG_DIR)
        ?? ($post['bg_url'] ?? null);

    /* ================= LANGUAGES ================= */

    $langMode = $post['language_mode'] ?? 'en';
    $languages =
        $langMode === 'en_gr'
        ? ['English', 'Greek']
        : ['English'];

    /* ================= LIVE CHAT ================= */

    $chatMode = $post['livechat_mode'] ?? 'en';
    $liveChat =
        $chatMode === 'en_gr'
        ? ['English', 'Greek']
        : ['English'];

    /* ================= WITHDRAWALS ================= */

    $withdrawals = [];
    $currency = $post['withdraw_currency'] ?? ($meta['defaultCurrency'] ?? 'EUR');

    $map = [
        'daily' => 'perDay',
        'weekly' => 'perWeek',
        'monthly' => 'perMonth'
    ];

    foreach ($map as $postKey => $jsonKey) {
        $field = "withdraw_$postKey";

        if (($post[$field] ?? '') !== '') {
            $withdrawals[$jsonKey] = [
                'amount' => (int) $post[$field],
                'currency' => $currency
            ];
        }
    }

    /* ================= BRAND OBJECT ================= */

    $id = trim($post['id'] ?? '');

    if ($id === '') {
        die('ID is required');
    }

    return [

        'id' => $id,
        'name' => trim($post['name']),

        'description' =>
            trim($post['description'] ?? '') !== ''
            ? trim($post['description'])
            : null,

        'media' => [
            'logo' => $logo,
            'background' => $background ?: null
        ],

        'company' => [
            'owner' => trim($post['owner']),
            'established' => (int) $post['year']
        ],

        'licenses' =>
            array_values(
                array_filter(
                    array_map('trim', explode(',', $post['licenses'] ?? ''))
                )
            ),

        'features' => [
            'vpnFriendly' => ($post['vpn'] ?? 'no') === 'yes',
            'languages' => $languages,
            'liveChat' => $liveChat
        ],

        'bonus' => [
            'percentage' =>
                $post['bonus_pct'] !== '' ? (int) $post['bonus_pct'] : null,
            'percentageUpTo' =>
                isset($post['bonus_pct_upto']),

            'maxAmount' =>
                $post['bonus_max'] !== '' ? (int) $post['bonus_max'] : null,
            'maxAmountUpTo' =>
                isset($post['bonus_max_upto']),

            'freeSpins' =>
                $post['free_spins'] !== '' ? (int) $post['free_spins'] : null,
            'freeSpinsUpTo' =>
                isset($post['free_spins_upto']),

            'wager' =>
                $post['wager'] !== '' ? (int) $post['wager'] : null,

            'exclusive' => (
                trim($post['exclusive_text'] ?? '') !== '' ||
                trim($post['exclusive_code'] ?? '') !== ''
            )
                ? [
                    'text' =>
                        trim($post['exclusive_text'] ?? '') !== ''
                        ? trim($post['exclusive_text'])
                        : null,

                    'promoCode' =>
                        trim($post['exclusive_code'] ?? '') !== ''
                        ? trim($post['exclusive_code'])
                        : null
                ]
                : null,
        ],

        'withdrawals' => $withdrawals,

        'links' => [
            'claimOffer' => $post['referral']
        ]
    ];
}
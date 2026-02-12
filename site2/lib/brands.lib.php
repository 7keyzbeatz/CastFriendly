<?php

/* =====================================================
   PATH CONFIG (BULLETPROOF)
===================================================== */

// Absolute filesystem root (1 level up from /lib)
define('ROOT_PATH', realpath(__DIR__ . '/..'));

// Detect protocol
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';

// Host (localhost or domain)
$host = $_SERVER['HTTP_HOST'];

// Folder path (/admin or /TEST-7KEYZBEATZ or empty)
$baseFolder = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');

// Full base URL (NO trailing slash)
define('BASE_URL', rtrim($protocol . $host . $baseFolder, '/'));

// Filesystem paths
define('DATA_FILE', ROOT_PATH . '/data/brands.json');
define('UPLOAD_ROOT', ROOT_PATH . '/uploads');
define('LOGO_DIR', UPLOAD_ROOT . '/logos');
define('BG_DIR', UPLOAD_ROOT . '/backgrounds');


/* =====================================================
   LOAD / SAVE
===================================================== */

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
    $data['meta']['lastUpdated'] = date('Y-m-d H:i:s');

    if ($bumpVersion) {
        $current = $data['meta']['version'] ?? '1.0';
        [$major, $minor] = array_pad(array_map('intval', explode('.', $current)), 2, 0);
        $minor++;
        $data['meta']['version'] = $major . '.' . $minor;
    }

    file_put_contents(
        DATA_FILE,
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
}


/* =====================================================
   HELPERS
===================================================== */

function slugify(string $name): string
{
    return strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $name), '-'));
}

function uploadImage(?array $file, string $dir): ?string
{
    if (!$file || $file['error'] !== UPLOAD_ERR_OK)
        return null;

    if (!is_dir($dir))
        mkdir($dir, 0755, true);

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, ['png', 'jpg', 'jpeg', 'webp']))
        return null;

    $name = uniqid('img_', true) . '.' . $ext;

    move_uploaded_file($file['tmp_name'], $dir . '/' . $name);

    // Convert filesystem dir to web path
    $folder = basename($dir);

    return BASE_URL . '/uploads/' . $folder . '/' . $name;
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
    /* =========================
       MEDIA
    ========================= */

    $logo =
        uploadImage($files['logo_file'] ?? null, LOGO_DIR)
        ?? ($post['logo_url'] ?? null);

    if (!$logo) {
        throw new RuntimeException('Logo required');
    }

    $background =
        uploadImage($files['bg_file'] ?? null, BG_DIR)
        ?? ($post['bg_url'] ?? null);

    /* =========================
       BASIC FIELDS
    ========================= */

    $id = trim($post['id'] ?? '');

    if ($id === '') {
        throw new RuntimeException('ID is required');
    }

    /* =========================
       LICENSES (string → array)
    ========================= */

    $licensesRaw = trim($post['licenses'] ?? '');
    $licenses = [];

    if ($licensesRaw !== '') {
        $licenses = array_values(
            array_filter(
                array_map('trim', explode(',', $licensesRaw))
            )
        );
    }

    /* =========================
   WITHDRAWALS (FORM MATCHED)
========================= */

    $withdrawals = [];

    $currency = $post['withdraw_currency'] ?? 'EUR';

    if (isset($post['withdraw_daily']) && $post['withdraw_daily'] !== '') {
        $withdrawals['perDay'] = [
            'amount' => (int) $post['withdraw_daily'],
            'currency' => $currency
        ];
    }

    if (isset($post['withdraw_weekly']) && $post['withdraw_weekly'] !== '') {
        $withdrawals['perWeek'] = [
            'amount' => (int) $post['withdraw_weekly'],
            'currency' => $currency
        ];
    }

    if (isset($post['withdraw_monthly']) && $post['withdraw_monthly'] !== '') {
        $withdrawals['perMonth'] = [
            'amount' => (int) $post['withdraw_monthly'],
            'currency' => $currency
        ];
    }

    /* =========================
       RETURN STRUCTURE
    ========================= */

    return [
        'id' => $id,
        'name' => trim($post['name'] ?? ''),
        'description' => trim($post['description'] ?? '') ?: null,

        'media' => [
            'logo' => $logo,
            'background' => $background ?: null
        ],

        'company' => [
            'owner' => trim($post['owner'] ?? ''),
            'established' => isset($post['year']) ? (int) $post['year'] : null
        ],

        'licenses' => $licenses,

        'features' => [
            'vpnFriendly' => ($post['vpn'] ?? 'no') === 'yes',
            'languages' => ['English'],
            'liveChat' => ['English']
        ],

        'bonus' => [
            'percentage' => $post['bonus_pct'] !== '' ? (int) $post['bonus_pct'] : null,
            'percentageUpTo' => false,
            'maxAmount' => $post['bonus_max'] !== '' ? (int) $post['bonus_max'] : null,
            'maxAmountUpTo' => false,
            'freeSpins' => $post['free_spins'] !== '' ? (int) $post['free_spins'] : null,
            'freeSpinsUpTo' => false,
            'wager' => $post['wager'] !== '' ? (int) $post['wager'] : null,
            'exclusive' => null
        ],

        'withdrawals' => $withdrawals,

        'links' => [
            'claimOffer' => $post['referral'] ?? ''
        ]
    ];
}
<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

/* =========================
   CONFIG
========================= */
define('ADMIN_ROOT', dirname(__DIR__));
define('DATA_FILE', ADMIN_ROOT . '/data/brands.json');
define('UPLOAD_ROOT', ADMIN_ROOT . '/uploads');
define('LOGO_DIR', UPLOAD_ROOT . '/logos');
define('BG_DIR', UPLOAD_ROOT . '/backgrounds');

/* =========================
   UTILITIES
========================= */
final class JsonStorage
{
    public static function load(string $path): array
    {
        if (!file_exists($path)) {
            throw new RuntimeException("JSON not found: $path");
        }
        $raw = preg_replace('/^\xEF\xBB\xBF/', '', file_get_contents($path));
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            throw new RuntimeException("Invalid JSON structure");
        }
        return $data;
    }

    public static function save(string $path, array $data): void
    {
        $tmp = $path . '.tmp';
        file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        rename($tmp, $path);
    }
}

final class ImageUploader
{
    public static function upload(array $file, string $targetDir): ?string
    {
        if ($file['error'] !== UPLOAD_ERR_OK)
            return null;

        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['png', 'jpg', 'jpeg', 'webp'])) {
            throw new RuntimeException('Invalid image type');
        }

        $name = uniqid('img_', true) . '.' . $ext;
        move_uploaded_file($file['tmp_name'], $targetDir . '/' . $name);

        return '/admin/uploads/' . basename($targetDir) . '/' . $name;
    }
}

final class BrandValidator
{
    public static function validate(array $in): void
    {
        $required = ['name', 'rank', 'language', 'owner', 'year', 'bonus_pct', 'description'];
        foreach ($required as $r) {
            if (empty($in[$r])) {
                throw new RuntimeException("Missing required field: $r");
            }
        }
        if (!isset($in['vpn'])) {
            throw new RuntimeException("VPN is required");
        }
    }
}

final class BrandRepository
{
    private array $data;

    public function __construct()
    {
        $this->data = JsonStorage::load(DATA_FILE);
        $this->data['brands'] ??= [];
    }

    public function all(): array
    {
        return $this->data['brands'];
    }

    public function save(): void
    {
        $this->data['meta']['lastUpdated'] = date('Y-m-d');
        JsonStorage::save(DATA_FILE, $this->data);
    }

    public function delete(string $id): void
    {
        $this->data['brands'] = array_values(array_filter(
            $this->data['brands'],
            fn($b) => $b['id'] !== $id
        ));
        $this->save();
    }

    public function upsert(array $brand): void
    {
        foreach ($this->data['brands'] as &$b) {
            if ($b['id'] === $brand['id']) {
                $b = $brand;
                $this->save();
                return;
            }
        }
        $this->data['brands'][] = $brand;
        $this->save();
    }
}

/* =========================
   CONTROLLER
========================= */
try {
    $repo = new BrandRepository();

    if (isset($_GET['delete'])) {
        $repo->delete($_GET['delete']);
        header('Location: brands_manager.php');
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        BrandValidator::validate($_POST);

        $logo = ImageUploader::upload($_FILES['logo'], LOGO_DIR)
            ?? ($_POST['logo_url'] ?? null);

        if (!$logo) {
            throw new RuntimeException('Logo required');
        }

        $bg = ImageUploader::upload($_FILES['background'], BG_DIR);

        $id = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $_POST['name']));

        $brand = [
            "id" => $id,
            "rank" => $_POST['rank'],
            "name" => $_POST['name'],
            "description" => $_POST['description'],
            "media" => [
                "logo" => $logo,
                "background" => $bg
            ],
            "company" => [
                "owner" => $_POST['owner'],
                "established" => (int) $_POST['year']
            ],
            "features" => [
                "vpnFriendly" => true,
                "languages" => [$_POST['language']]
            ],
            "bonus" => [
                "percentage" => (int) $_POST['bonus_pct'],
                "maxAmount" => $_POST['bonus_max'] !== '' ? (int) $_POST['bonus_max'] : null,
                "freeSpins" => $_POST['free_spins'] !== '' ? (int) $_POST['free_spins'] : null,
                "wager" => $_POST['wager'] !== '' ? (int) $_POST['wager'] : null,
                "code" => $_POST['bonus_code'] ?: null
            ],
            "withdrawals" => [
                "daily" => (int) $_POST['withdraw_daily'],
                "weekly" => (int) $_POST['withdraw_weekly'],
                "monthly" => (int) $_POST['withdraw_monthly']
            ]
        ];

        $repo->upsert($brand);
        header('Location: brands_manager.php');
        exit;
    }

} catch (Throwable $e) {
    echo "<pre style='color:red;font-weight:bold'>" . $e->getMessage() . "</pre>";
}

/* =========================
   UI (MINIMAL – WORKING)
========================= */
$brands = $repo->all();
?>
<!doctype html>
<html lang="el">
<head>
<meta charset="utf-8">
<title>7heGodFamilia – Brands Manager</title>

<style>
:root {
  --bg:#020617;
  --card:#0f172a;
  --border:#1f2937;
  --gold:#f5a524;
  --text:#e5e7eb;
  --muted:#9ca3af;
  --danger:#dc2626;
  --success:#16a34a;
}

* { box-sizing:border-box; }

body {
  margin:0;
  font-family: Inter, system-ui, Arial;
  background: radial-gradient(circle at top, #020617, #000);
  color:var(--text);
}

/* ---------- Layout ---------- */
.wrapper {
  max-width:1400px;
  margin:auto;
  padding:40px;
  display:grid;
  grid-template-columns: 420px 1fr;
  gap:30px;
}

/* ---------- Cards ---------- */
.card {
  background:linear-gradient(180deg, rgba(15,23,42,.95), rgba(2,6,23,.95));
  border:1px solid var(--border);
  border-radius:24px;
  padding:24px;
  box-shadow:0 20px 60px rgba(0,0,0,.4);
}

.card h2 {
  margin:0 0 20px;
  font-size:18px;
  color:var(--gold);
  letter-spacing:.08em;
  text-transform:uppercase;
}

/* ---------- Form ---------- */
.form-group {
  margin-bottom:14px;
}

label {
  font-size:11px;
  color:var(--muted);
  text-transform:uppercase;
  font-weight:700;
  letter-spacing:.1em;
}

input, textarea, select {
  width:100%;
  margin-top:6px;
  padding:12px 14px;
  background:#020617;
  border:1px solid var(--border);
  border-radius:14px;
  color:#fff;
  outline:none;
}

textarea { resize:none; min-height:90px; }

input:focus, textarea:focus, select:focus {
  border-color:var(--gold);
  box-shadow:0 0 0 1px rgba(245,165,36,.4);
}

.checkbox {
  display:flex;
  align-items:center;
  gap:10px;
  margin-top:10px;
  font-size:14px;
}

.checkbox input { width:auto; }

/* ---------- Buttons ---------- */
button {
  margin-top:20px;
  width:100%;
  padding:14px;
  border-radius:999px;
  border:none;
  font-weight:900;
  letter-spacing:.08em;
  cursor:pointer;
  background:linear-gradient(135deg, #f5a524, #ffcc70);
  color:#000;
  transition:.25s;
}

button:hover {
  transform:translateY(-2px);
  box-shadow:0 10px 30px rgba(245,165,36,.4);
}

/* ---------- Brands Grid ---------- */
.brands {
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(260px,1fr));
  gap:20px;
}

.brand {
  background:linear-gradient(180deg, #020617, #020617);
  border:1px solid var(--border);
  border-radius:22px;
  padding:18px;
  position:relative;
  transition:.3s;
}

.brand:hover {
  transform:translateY(-4px);
  box-shadow:0 20px 50px rgba(0,0,0,.5);
}

.brand img {
  max-height:50px;
  max-width:140px;
  object-fit:contain;
  margin-bottom:10px;
}

.brand-name {
  font-weight:800;
  font-size:15px;
}

.brand-rank {
  position:absolute;
  top:14px;
  right:14px;
  background:var(--gold);
  color:#000;
  font-weight:900;
  border-radius:999px;
  padding:4px 12px;
  font-size:12px;
}

/* ---------- Actions ---------- */
.actions {
  display:flex;
  gap:10px;
  margin-top:14px;
}

.actions a {
  flex:1;
  text-align:center;
  padding:10px;
  border-radius:999px;
  font-size:12px;
  text-transform:uppercase;
  letter-spacing:.08em;
  font-weight:800;
  text-decoration:none;
  transition:.25s;
}

.edit { background:#2563eb; color:#fff; }
.delete { background:#dc2626; color:#fff; }

.edit:hover, .delete:hover {
  transform:scale(1.05);
}
</style>
</head>

<body>

<div class="wrapper">

  <!-- FORM -->
  <div class="card">
    <h2>Add / Update Brand</h2>

    <form method="POST" enctype="multipart/form-data">
      <div class="form-group">
        <label>Name *</label>
        <input name="name" required>
      </div>

      <div class="form-group">
        <label>Rank *</label>
        <input name="rank" required>
      </div>

      <div class="form-group">
        <label>Language *</label>
        <select name="language">
          <option>English</option>
          <option>Greek</option>
        </select>
      </div>

      <div class="form-group">
        <label>Owner *</label>
        <input name="owner" required>
      </div>

      <div class="form-group">
        <label>Year *</label>
        <input type="number" name="year" required>
      </div>

      <div class="form-group">
        <label>Bonus % *</label>
        <input type="number" name="bonus_pct" required>
      </div>

      <div class="form-group">
        <label>Description *</label>
        <textarea name="description" required></textarea>
      </div>

      <div class="form-group">
        <label>Logo (upload or url) *</label>
        <input type="file" name="logo">
        <input name="logo_url" placeholder="https://...">
      </div>

      <div class="form-group">
        <label>Background image</label>
        <input type="file" name="background">
      </div>

      <div class="form-group">
        <label>Withdraw limits</label>
        <input name="withdraw_daily" placeholder="Daily">
        <input name="withdraw_weekly" placeholder="Weekly">
        <input name="withdraw_monthly" placeholder="Monthly">
      </div>

      <div class="checkbox">
        <input type="checkbox" name="vpn" required>
        VPN Friendly (required)
      </div>

      <button>Save Brand</button>
    </form>
  </div>

  <!-- BRANDS -->
  <div>
    <div class="brands">
      <?php foreach ($brands as $b): ?>
      <div class="brand">
        <div class="brand-rank"><?= htmlspecialchars($b['rank']) ?></div>
        <img src="<?= htmlspecialchars($b['media']['logo']) ?>">
        <div class="brand-name"><?= htmlspecialchars($b['name']) ?></div>

        <div class="actions">
          <a class="edit" href="?edit=<?= $b['id'] ?>">Edit</a>
          <a class="delete" href="?delete=<?= $b['id'] ?>" onclick="return confirm('Delete?')">Delete</a>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>

</div>

</body>
</html>
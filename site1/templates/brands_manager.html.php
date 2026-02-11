<!doctype html>
<html lang="el">
<head>
<meta charset="utf-8">
<title>Brands Manager</title>
<link rel="stylesheet" href="/admin/assets/css/admin.css">
</head>
<body>

<div class="admin-wrapper">

<div class="form-card" id="brand-form">
<h2><?= $editBrand ? 'Edit Brand: ' . htmlspecialchars($editBrand['name']) : 'Add New Brand' ?></h2>

<?php if ($editBrand): ?>
<a class="cancel-edit" href="brands_manager.php">✖ Cancel Edit</a>
<?php endif; ?>

<?php if ($errors): ?>
<div class="errors">
<?php foreach ($errors as $e): ?><div><?= htmlspecialchars($e) ?></div><?php endforeach; ?>
</div>
<?php endif; ?>

<form method="POST" enctype="multipart/form-data">
<input type="hidden" name="editing_id" value="<?= $editBrand['id'] ?? '' ?>">

<input name="name" placeholder="Casino Name *" value="<?= $editBrand['name'] ?? '' ?>">
<input name="rank" placeholder="Rank *" value="<?= $editBrand['rank'] ?? '' ?>">
<input name="owner" placeholder="Owner *" value="<?= $editBrand['company']['owner'] ?? '' ?>">
<input name="year" type="number" min="1990" max="<?= date('Y') ?>" placeholder="Year *" value="<?= $editBrand['company']['established'] ?? '' ?>">
<input name="licenses" placeholder="Licenses (comma separated)" value="<?= isset($editBrand['licenses']) ? implode(', ', $editBrand['licenses']) : '' ?>">

<label>Languages *</label>
<select name="languages[]" multiple>
<option value="English">English</option>
<option value="Greek">Greek</option>
</select>

<label>VPN *</label>
<select name="vpn">
<option value="">Select</option>
<option value="1">Yes</option>
<option value="0">No</option>
</select>

<textarea name="description" placeholder="Description"><?= $editBrand['description'] ?? '' ?></textarea>

<h3>Media</h3>
<input type="file" name="logo">
<input name="logo_url" placeholder="Logo URL">

<input type="file" name="background">
<input name="background_url" placeholder="Background URL">

<h3>Bonus</h3>
<input name="bonus_pct" placeholder="Bonus %">
<input name="bonus_max" placeholder="Max Bonus €">
<input name="free_spins" placeholder="Free Spins">
<input name="wager" placeholder="Wager x">
<input name="bonus_code" placeholder="Promo Code">
<textarea name="bonus_code_desc" placeholder="Promo Description"></textarea>

<h3>Withdrawals</h3>
<input name="wd_day" placeholder="Daily Amount">
<select name="wd_day_cur"><option>EUR</option><option>USD</option></select>

<input name="wd_week" placeholder="Weekly Amount">
<select name="wd_week_cur"><option>EUR</option><option>USD</option></select>

<input name="wd_month" placeholder="Monthly Amount">
<select name="wd_month_cur"><option>EUR</option><option>USD</option></select>

<input name="claimOffer" placeholder="Referral URL *" value="<?= $editBrand['links']['claimOffer'] ?? '' ?>">

<button name="save"><?= $editBrand ? 'Update Brand' : 'Add Brand' ?></button>
</form>
</div>

<div class="list-section">
<div class="list-header">
<h2>Brands</h2>
<a href="brands_manager.php" class="btn-primary">➕ Add Brand</a>
</div>

<?php if (empty($brands)): ?>
<div class="empty-state">
<p>No brands found</p>
</div>
<?php else: ?>
<div class="brands-list" id="brandsList">
<?php foreach ($brands as $b): ?>
<div class="brand-card" data-id="<?= $b['id'] ?>">
<div class="card-top">
<span class="rank"><?= htmlspecialchars($b['rank']) ?></span>
<div class="card-actions">
<a href="?edit=<?= $b['id'] ?>">Edit</a>
<a href="?delete=<?= $b['id'] ?>" onclick="return confirm('Delete brand?')">Delete</a>
</div>
</div>
<img src="<?= $b['media']['logo'] ?>">
<strong><?= htmlspecialchars($b['name']) ?></strong>
<div class="drag-handle">☰</div>
</div>
<?php endforeach; ?>
</div>
<?php endif; ?>
</div>

</div>

<script src="/admin/assets/js/admin.js"></script>
</body>
</html>
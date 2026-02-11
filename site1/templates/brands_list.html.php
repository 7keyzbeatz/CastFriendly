<!doctype html>
<html lang="el">
<head>
<meta charset="utf-8">
<title>Brands Manager</title>
<link rel="stylesheet" href="/admin/assets/css/admin.css">
<script src="/admin/assets/js/admin.js" defer></script>
</head>
<body>

<div class="page">

<header class="header">
  <h1>Brands</h1>
  <a href="brand_add.php" class="btn-primary">➕ Add Brand</a>
</header>

<?php if (empty($brands)): ?>
  <div class="empty-state">
    <h2>Δεν υπάρχουν brands</h2>
    <p>Ξεκίνα προσθέτοντας το πρώτο καζίνο.</p>
    <a href="brand_add.php" class="btn-primary">Add Brand</a>
  </div>
<?php else: ?>
  <div class="brands-grid" id="brandsGrid">
    <?php foreach ($brands as $b): ?>
      <div class="brand-card" data-id="<?= htmlspecialchars($b['id']) ?>">

        <span class="rank"><?= htmlspecialchars($b['id']) ?></span>

        <img src="<?= htmlspecialchars($b['media']['logo']) ?>"
             alt="<?= htmlspecialchars($b['name']) ?>">

        <div class="brand-name">
          <?= htmlspecialchars($b['name']) ?>
        </div>

        <div class="card-footer">
          <div class="card-actions">
            <a class="edit-btn"
               href="brand_edit.php?id=<?= urlencode($b['id']) ?>">Edit</a>

            <a class="delete-btn"
               href="?delete=<?= urlencode($b['id']) ?>"
               onclick="return confirm('Delete this brand?')">Delete</a>
          </div>

          <div class="drag-handle" title="Drag to reorder">☰</div>
        </div>

      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>

</div>
</body>
</html>
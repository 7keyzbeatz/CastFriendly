<?php
// OPTIONAL: έλεγχος αν υπάρχει active giveaway
?>
<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8">
<title>Συμμετοχή Giveaway</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="stylesheet" href="css/brands.css">
<link rel="stylesheet" href="css/giveaways.css">
<link rel="stylesheet" href="css/submit.css">
</head>
<body>

<header class="topbar">
  <a href="home.html" class="logo">
        7he<span>God</span>Familia
    </a>
  <nav>
    <a href="home.html">Home</a>
    <a href="brands.html">Brands</a>
    <a href="giveaways.html">Giveaways</a>
    <a href="rules.html">Rules</a>
  </nav>
</header>

<div class="submit-page">

  <div class="submit-card">

      <h1>Υποβολή Συμμετοχής</h1>

      <form action="upload.php" method="POST" enctype="multipart/form-data">

          <div class="form-group">
              <label>Όνομα</label>
              <input type="text" name="name" required>
          </div>

          <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" required>
          </div>

          <div class="form-group">
              <label>Casino</label>
              <select name="casino" required>
                  <option value="">Επιλογή Casino</option>
                  <option>Spinorhino</option>
                  <option>JetHolo</option>
                  <option>Άλλο</option>
              </select>
          </div>

          <div class="form-group">
              <label>Screenshot</label>
              <input type="file" name="screenshot" accept="image/*" required>
          </div>

          <button type="submit" class="cta-btn full">
              Αποστολή
          </button>

      </form>

  </div>

</div>

</body>
</html>
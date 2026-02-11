<!doctype html>
<html lang="el">
<head>
    <meta charset="utf-8">
    <title><?= $mode === 'edit' ? 'Edit Brand' : 'Add New Brand' ?></title>
    <link rel="stylesheet" href="/admin/assets/css/admin.css">
    <script src="/admin/assets/js/admin.js" defer></script>
</head>
<body>

<div class="page brand-form-page">

    <header class="header">
        <h1><?= $mode === 'edit' ? 'Edit Brand' : 'Add New Brand' ?></h1>

        <div class="header-actions">
            <a href="brands_manager.php" class="btn-cancel">Cancel</a>
            <button type="submit" form="brandForm" class="btn-primary">
                <?= $mode === 'edit' ? 'Save Changes' : 'Add Brand' ?>
            </button>
        </div>
    </header>

    <?php if (!empty($noChanges)): ?>
        <div class="notice notice-info" id="noChangesNotice">
            <strong>ℹ️ Καμία αλλαγή</strong><br>
            Δεν εντοπίστηκαν αλλαγές στο brand. Δεν αποθηκεύτηκε κάτι.
        </div>
    <?php endif; ?>

    <form id="brandForm" method="POST" enctype="multipart/form-data">

        <section class="form-card">
            <h2>Basic Info</h2>
            <div class="form-grid">

                <div class="field">
                    <label>Casino Name *</label>
                    <input name="name" required value="<?= htmlspecialchars($brand['name']) ?>">
                </div>

                <div class="field">
                    <label>Brand ID / Position *</label>
                    <input 
                        type="text" 
                        name="id" 
                        required 
                        placeholder="π.χ. A, B, 1, 2" 
                        value="<?= htmlspecialchars($brand['id'] ?? '') ?>">
                </div>

                <div class="field">
                    <label>Owner *</label>
                    <input name="owner" required value="<?= htmlspecialchars($brand['company']['owner']) ?>">
                </div>

                <div class="field">
                    <label>Established Year *</label>
                    <input type="number" name="year" required value="<?= htmlspecialchars($brand['company']['established']) ?>">
                </div>

                <div class="field field-full">
                    <label>Licenses *</label>
                    <input name="licenses" required value="<?= htmlspecialchars(implode(', ', $brand['licenses'])) ?>">
                </div>

            </div>
        </section>

        <section class="form-card">
            <h2>Description</h2>
            <textarea name="description"><?= htmlspecialchars($brand['description']) ?></textarea>
        </section>

        <section class="form-card">
            <h2>Features</h2>
            <div class="form-grid">

                <div class="field">
                    <label>Site Languages *</label>
                    <select name="language_mode" required>
                        <option value="en" <?= ($brand['features']['languages'] ?? []) === ['English'] ? 'selected' : ' ' ?>>
                            English Only
                        </option>
                        <option value="en_gr" <?= in_array('Greek', $brand['features']['languages'] ?? []) ? 'selected' : '' ?>>
                            English & Greek
                        </option>
                    </select>
                </div>

                <div class="field">
                    <label>Live Chat Support *</label>
                    <select name="livechat_mode" required>
                        <option value="en" <?= ($brand['features']['liveChat'] ?? []) === ['English'] ? 'selected' : '' ?>>
                            English Only
                        </option>
                        <option value="en_gr" <?= in_array('Greek', $brand['features']['liveChat'] ?? []) ? 'selected' : '' ?>>
                            English & Greek
                        </option>
                    </select>
                </div>

                <div class="field">
                    <label>VPN Allowed *</label>
                    <select name="vpn" required>
                        <option value="no" <?= empty($brand['features']['vpnFriendly']) ? 'selected' : '' ?>>
                            No
                        </option>
                        <option value="yes" <?= !empty($brand['features']['vpnFriendly']) ? 'selected' : '' ?>>
                            Yes
                        </option>
                    </select>
                </div>

            </div>
        </section>

        <section class="form-card">
            <h2>Media</h2>
            <div class="form-grid">

                <div class="field">
                    <label>Logo Upload *</label>
                    <div class="upload-card" data-input="logo_file">
                        <span class="upload-icon">🖼️</span>
                        <span class="upload-text">Click or drop logo</span>

                        <img class="upload-preview"
                             src="<?= htmlspecialchars($brand['media']['logo'] ?? '') ?>"
                             <?= empty($brand['media']['logo']) ? 'style="display:none"' : '' ?>>
                    </div>

                    <input type="file"
                           name="logo_file"
                           id="logo_file"
                           accept="image/*"
                           hidden>
                </div>

                <div class="field">
                    <label>Logo URL *</label>
                    <input name="logo_url" value="<?= htmlspecialchars($brand['media']['logo'] ?? '') ?>">
                </div>

                <div class="field">
                    <label>Background Upload</label>
                    <div class="upload-card" data-input="bg_file">
                        <span class="upload-icon">🖼️</span>
                        <span class="upload-text">Click or drop background</span>

                        <img class="upload-preview"
                             src="<?= htmlspecialchars($brand['media']['background'] ?? '') ?>"
                             <?= empty($brand['media']['background']) ? 'style="display:none"' : '' ?>>
                    </div>

                    <input type="file"
                           name="bg_file"
                           id="bg_file"
                           accept="image/*"
                           hidden>
                </div>

                <div class="field">
                    <label>Background URL</label>
                    <input name="bg_url" value="<?= htmlspecialchars($brand['media']['background'] ?? '') ?>">
                </div>

            </div>
        </section>

        <section class="form-card">
            <h2>Bonus</h2>

            <!-- EXCLUSIVE BONUS -->
              <div class="form-grid">
                <div class="field field-full">
                  <label>Exclusive Bonus Text (optional)</label>
                  <input name="exclusive_text"
                         value="<?= htmlspecialchars($brand['bonus']['exclusive']['text'] ?? '') ?>">
                </div>

                <div class="field">
                  <label>Exclusive Promo Code</label>
                  <input name="exclusive_code"
                         value="<?= htmlspecialchars($brand['bonus']['exclusive']['promoCode'] ?? '') ?>">
                </div>
              </div>
            
            <div class="bonus-row">
                <div class="field">
                    <label>Bonus %</label>
                    <input type="number" name="bonus_pct" value="<?= htmlspecialchars($brand['bonus']['percentage'] ?? '') ?>">
                </div>
                <label class="upto">
                    <input type="checkbox" name="bonus_pct_upto" <?= !empty($brand['bonus']['percentageUpTo']) ? 'checked' : '' ?>> Up to
                </label>
            </div>

            <div class="bonus-row">
                <div class="field">
                    <label>Max Bonus (€)</label>
                    <input type="number" name="bonus_max" value="<?= htmlspecialchars($brand['bonus']['maxAmount'] ?? '') ?>">
                </div>
                <label class="upto">
                    <input type="checkbox" name="bonus_max_upto" <?= !empty($brand['bonus']['maxAmountUpTo']) ? 'checked' : '' ?>> Up to
                </label>
            </div>

            <div class="bonus-row">
                <div class="field">
                    <label>Free Spins</label>
                    <input type="number" name="free_spins" value="<?= htmlspecialchars($brand['bonus']['freeSpins'] ?? '') ?>">
                </div>
                <label class="upto">
                    <input type="checkbox" name="free_spins_upto" <?= !empty($brand['bonus']['freeSpinsUpTo']) ? 'checked' : '' ?>> Up to
                </label>
            </div>

            <div class="field">
                <label>Wager (x)</label>
                <input type="number" name="wager" value="<?= htmlspecialchars($brand['bonus']['wager'] ?? '') ?>">
            </div>
        </section>

        <section class="form-card">
            <h2>Withdrawals</h2>
            <div class="form-grid">

                <div class="field">
                    <label>Daily Limit</label>
                    <input type="number" name="withdraw_daily" value="<?= htmlspecialchars($brand['withdrawals']['perDay']['amount'] ?? '') ?>">
                </div>

                <div class="field">
                    <label>Weekly Limit</label>
                    <input type="number" name="withdraw_weekly" value="<?= htmlspecialchars($brand['withdrawals']['perWeek']['amount'] ?? '') ?>">
                </div>

                <div class="field">
                    <label>Monthly Limit</label>
                    <input type="number" name="withdraw_monthly" value="<?= htmlspecialchars($brand['withdrawals']['perMonth']['amount'] ?? '') ?>">
                </div>

                <div class="field">
                    <label>Currency</label>
                    <select name="withdraw_currency">
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                    </select>
                </div>

            </div>
        </section>

        <section class="form-card">
            <h2>Referral</h2>
            <div class="form-grid">
                <div class="field field-full">
                    <label>Claim Offer URL *</label>
                    <input name="referral" required value="<?= htmlspecialchars($brand['links']['claimOffer'] ?? '') ?>">
                </div>
            </div>
        </section>

        <div class="form-actions">
            <button type="submit" class="btn-primary">
                <?= $mode === 'edit' ? 'Save Changes' : 'Add Brand' ?>
            </button>
        </div>

    </form>
</div>

</body>
</html>
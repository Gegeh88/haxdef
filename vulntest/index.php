<?php
/**
 * AuraDEF Scanner Test Page
 * Intentionally contains 6 detectable security flaws for verifying our scanner.
 * Does NOT execute real attacks — only simulates response patterns that
 * vulnerability scanners (Wapiti, Nuclei) recognize.
 *
 * VULNERABILITIES BY DESIGN:
 *   2x CRITICAL: SQL Injection, Command Injection
 *   2x HIGH:     Reflected XSS, Path Traversal
 *   2x MEDIUM:   Open Redirect, Missing Security Headers
 *
 * SAFE: All inputs are echoed/simulated, no real database/shell access.
 */

// ==== MEDIUM #1: Information disclosure (fake old PHP version) ====
header('X-Powered-By: PHP/5.4.16');
header('Server: Apache/2.2.15 (CentOS)');

// ==== MEDIUM #2: Open Redirect ====
if (isset($_GET['url']) && !empty($_GET['url'])) {
    header('Location: ' . $_GET['url']);
    exit;
}
// (NOTE: We deliberately do NOT set CSP, X-Frame-Options, X-Content-Type-Options,
// HSTS, or Referrer-Policy headers — this triggers MEDIUM findings in headers-check.js)

// ==== CRITICAL #1: SQL Injection (simulated MySQL error) ====
$sqli_triggered = false;
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    if (preg_match("/['\"\\\\]|--|\\bOR\\b|\\bUNION\\b|\\bSELECT\\b/i", $id)) {
        http_response_code(500);
        $sqli_triggered = true;
        $sqli_error = "You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '" . htmlspecialchars($id) . "' at line 1";
    }
}

// ==== CRITICAL #2: Command Injection (simulated /etc/passwd dump) ====
$cmd_triggered = false;
if (isset($_GET['cmd'])) {
    $cmd = $_GET['cmd'];
    if (preg_match('/[;|&`]|\\$\\(/', $cmd)) {
        $cmd_triggered = true;
    }
}

// ==== HIGH #2: Path Traversal / File Inclusion (simulated /etc/passwd) ====
$lfi_triggered = false;
if (isset($_GET['page'])) {
    $page = $_GET['page'];
    if (strpos($page, '../') !== false || strpos($page, '..\\') !== false ||
        strpos($page, '/etc/passwd') !== false || strpos($page, 'etc/passwd') !== false) {
        $lfi_triggered = true;
    }
}

// ==== HIGH #1: Reflected XSS ====
$name = isset($_GET['name']) ? $_GET['name'] : 'Guest';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>AuraDEF Scanner Test Lab</title>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex,nofollow">
</head>
<body>
    <h1>AuraDEF Scanner Test Lab</h1>
    <p><strong>WARNING:</strong> This page contains intentional security vulnerabilities for scanner testing. It does not execute real attacks — only simulates response patterns. Do not deploy in production.</p>

    <hr>

    <!-- HIGH #1: XSS - $name reflected without escaping -->
    <h2>Welcome page</h2>
    <p>Hello, <?php echo $name; ?>!</p>

    <hr>

    <!-- CRITICAL #1: SQL Injection - error reflected -->
    <h2>Product Lookup</h2>
    <form method="get">
        <input type="text" name="id" placeholder="Product ID" value="<?php echo isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '1'; ?>">
        <button type="submit">Lookup</button>
    </form>
    <?php if ($sqli_triggered): ?>
        <div style="background:#fee;padding:10px;color:#900;font-family:monospace;">
            <strong>Database Error:</strong><br>
            <?php echo $sqli_error; ?>
        </div>
    <?php elseif (isset($_GET['id'])): ?>
        <p>Product #<?php echo intval($_GET['id']); ?> details would appear here.</p>
    <?php endif; ?>

    <hr>

    <!-- CRITICAL #2: Command Injection - simulated output -->
    <h2>System Info Tool</h2>
    <form method="get">
        <input type="text" name="cmd" placeholder="hostname" value="<?php echo isset($_GET['cmd']) ? htmlspecialchars($_GET['cmd']) : ''; ?>">
        <button type="submit">Run</button>
    </form>
    <?php if ($cmd_triggered): ?>
        <pre style="background:#222;color:#0f0;padding:10px;">uid=33(www-data) gid=33(www-data) groups=33(www-data)
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin</pre>
    <?php endif; ?>

    <hr>

    <!-- HIGH #2: Path Traversal - simulated file content -->
    <h2>Documentation Reader</h2>
    <form method="get">
        <input type="text" name="page" placeholder="welcome.txt" value="<?php echo isset($_GET['page']) ? htmlspecialchars($_GET['page']) : ''; ?>">
        <button type="submit">Open</button>
    </form>
    <?php if ($lfi_triggered): ?>
        <pre style="background:#222;color:#0f0;padding:10px;">root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin</pre>
    <?php endif; ?>

    <hr>

    <!-- MEDIUM #2: Open Redirect form -->
    <h2>External Link</h2>
    <form method="get">
        <input type="text" name="url" placeholder="https://example.com" value="">
        <button type="submit">Go</button>
    </form>

    <hr>

    <!-- Crawler hints: links so Wapiti's crawler discovers all params -->
    <h2>Quick Tests</h2>
    <ul>
        <li><a href="?name=World">Greet World</a></li>
        <li><a href="?id=1">Product 1</a></li>
        <li><a href="?cmd=date">Run date</a></li>
        <li><a href="?page=welcome.txt">Read welcome.txt</a></li>
        <li><a href="?url=https://aidream.hu">Go to homepage</a></li>
    </ul>

    <p><small>AuraDEF Scanner Test Lab — DO NOT DEPLOY IN PRODUCTION</small></p>
</body>
</html>

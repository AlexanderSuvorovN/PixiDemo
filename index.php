<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Alexander SUVOROV</title>
    <link rel='stylesheet' href='/css/style.css'>
    <script src="/js/jquery/jquery-3.5.1.min.js"></script>
    <script src="/js/pixi/pixi.js"></script>
    <script src="/js/demo.js"></script>
    <?php
    // <script src="/js/pixi/pixi.min.js"></script>
    ?>
</head>
<body>
    <div class='controls'>
        <button id='undo'>Отменить</button>
        <button id='import'>Импорт</button>
        <button id='export'>Экспорт</button>
    </div>
    <div class='flex'>
        <div class='history'></div>
        <div class='canvas'></div>
    </div>
</body>
</html>
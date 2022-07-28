var ocr_api = {};
// 外置
ocr_api.ww = function (img) {
    
    var Base64_img = images.toBase64(img, 'jpeg', 55);
    console.log('外置OCR文字识别中');
    try {
        var socket = java.net.Socket()
        socket.connect(java.net.InetSocketAddress("127.0.0.1", 12370))
        console.log("连接成功发生中")
        let output = socket.getOutputStream()
        let ps = java.io.PrintStream(output, true, "utf-8")
        ps.println(Base64_img)
        ps.flush()
        console.info('发送成功，等待接收');
        let input = socket.getInputStream()
        let buffReader = java.io.BufferedReader(java.io.InputStreamReader(input, "utf-8"))
        let message = buffReader.readLine()
        if (message != null) {
            // log("外置OCR识别出来的文本 " + message)
            ps.close()
            buffReader.close()
            socket.close()
            return message;
        } else {
            console.error("client: 服务器返回空消息")
            return "undefined";
        }
    } catch (e) {
        console.error(e);
        console.error("外置OCR识别出错");
        socket.close()
        return "undefined";
    }
};
// 浩然
ocr_api.hr = function (img) {
    img = images.scale(img, 0.4, 0.4); // 将图片缩放为原来的一半
    var ocr = plugins.load('com.hraps.ocr');
    console.log('浩然ocr文字识别中');
    try {
        var answer = "";
        var results = ocr.detect(img.getBitmap(), 1);
        for (var i = 0; i < results.size(); i++) {
            var s = results.get(i).text;
            answer += s;
            // 提取图片中的文字
        }
        // console.info(answer.replace(/\s*/g, ""));
        return answer.replace(/\s*/g, "");
    } catch (e) {
        console.error(e);
        console.info("第三方OCR插件安装错了位数，分为64位和32位\n卸载之前的插件，换一个位数安装");
        exit();
    }
};
// 飞浆
ocr_api.fj = function (img) {
    var txt
    console.log('内置飞浆文字识别中');
    try {
        // var txt = paddle.ocrText(img, 8, "/sdcard/科技!解放!/ocr_v2_for_cpu(slim)/").join("")
        var thread = new java.lang.Thread(function () {
            img = images.scale(img, 0.4, 0.4); // 将图片缩放为原来的一半
            txt = paddle.ocrText(img, 8, true).join("")
            //exit()
            return txt
        });
        thread.setPriority(10)
        thread.start()
        thread.join()
    } catch (e) {
        console.error(e);
    }
    return txt;
};

module.exports = ocr_api;
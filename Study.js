"auto";
console.setTitle("科技!解放!","#ff11ee00",20);
auto.waitFor();
importClass(android.database.sqlite.SQLiteDatabase);
importClass(java.net.HttpURLConnection);
importClass(java.net.URL);
importClass(java.io.File);
importClass(java.io.FileOutputStream);
console.info("读配置文件");
try {
    var 配置_其他 = files.read('/sdcard/科技!解放!/profile_其他.json');
    配置_其他 = JSON.parse(配置_其他);
    var 配置_选项 = files.read('/sdcard/科技!解放!/profile_选项.json');
    配置_选项 = JSON.parse(配置_选项);
} catch (e) {
    console.error("无法读取配置文件");
    exit();
}
var path = '/sdcard/科技!解放!/QuestionBank.db';
device.wakeUpIfNeeded(); //点亮屏幕
var meizhou_txt = 配置_选项.meizhou;
var zhuanxiang_txt = 配置_选项.zhuanxiang;
var siren = 配置_选项.shireng;
var loca = 配置_选项.loca;
var debug = false;
var shuangren = 配置_选项.shuangreng;
var articles = 配置_选项.article;
var video = 配置_选项.video;
var meiri = 配置_选项.meiri;
var tiaozhan = 配置_选项.tiaozhan;
var 订阅 = 配置_选项.ssub;
var first_com_no = 配置_选项.first_com_no;// 首轮不答
var cic = false;
var easyedge_ocr_url = 'http://127.0.0.1:34567/';
var ocr_model = 配置_其他.ocr_kind;
var whethe = 配置_选项.whethe;
if (whethe) var volume = device.getMusicVolume();
var 专项答题下滑 = 配置_其他.Z_mode;
var 每周答题下滑 = 配置_其他.M_mode;
var 竞赛延迟时间 = 配置_其他.com_sleep * 1;
var pos_sleep = 1;
let ocr;
var token;
var ttt;
var question_list = [];
var thread1_i = 0;
var thread1_ii = 0;
var status = false;//是否暂停
while (status) { console.log("主线程暂停中"); sleep(750); };
/**
 * 人机验证
 */
var thread1 = threads.start(function () {
    console.info("反滑块验证已启动");
    while (true) {
        if (textContains('访问异常').exists()) {
            console.hide();
            toastLog("隐藏控制台");
            thread1_i++;
            status = true;
            console.error("人机验证！");
            textContains("向右滑动验证").waitFor();
            var hk_t = textContains("向右滑动验证").findOne().parent().parent().bounds();
            console.log(hk_t);
            var x1_t = hk_t.left + 50,
                x2_t = hk_t.right - 30,
                y = hk_t.bottom - hk_t.top,
                y2 = y / 2,
                y1_t = hk_t.top + y2,
                y2_t = y1_t;
            console.log(hk_t.bottom, hk_t.top);
            console.info(x1_t, y1_t, x2_t, y2_t, y, y2);
            console.info(x1_t, y1_t, x2_t, y2_t);
            delay(0.3);
            swipe(x1_t, y1_t, x2_t, y2_t, 1500);
            var sleep_i = 0;
            while (text("向右滑动验证").exists()) {
                if (sleep_i > 3) {
                    console.error("可能滑动失败!");
                    if (textContains("非常抱歉").exists()) {
                        textContains("刷新").click();
                    }
                    delay(1);
                    text("向右滑动验证").waitFor();
                    var hk_t = textContains("向右滑动验证").findOne().parent().parent().bounds();
                    console.log(hk_t);
                    var x1_t = hk_t.left + 50,
                        x2_t = hk_t.right - 30,
                        y = hk_t.bottom - hk_t.top,
                        y2 = y / 2,
                        y1_t = hk_t.top + y2,
                        y2_t = y1_t;
                    console.log(hk_t.bottom, hk_t.top);
                    console.info(x1_t, y1_t, x2_t, y2_t, y, y2);
                    console.info(x1_t, y1_t, x2_t, y2_t);
                    console.info("再次尝试滑动");
                    swipe(x1_t, y1_t, x2_t, y2_t, 1500);
                }
                sleep_i++;
                sleep(900);
            }
            console.show();
            console.setBackgroud("#E6393737");
            console.setLogSize(10);
            thread1_ii++;
        }
        if (status) status = false;
    }
});
thread1.waitFor();

function check_easyedge_ocr() {
    try {
        var check_url = http.get(easyedge_ocr_url);
        if (check_url.statusCode >= 200 && check_url.statusCode < 300) {
            console.info('easyedge_ocr正常');
        } else if (check_url.statusCode == 404) {
            console.error('easyedge_ocr异常');
            exit();
        } else {
            console.error('错误: 请检查OCR');
            exit();
        }
    } catch (e) {
        console.error('easyedge_ocr未启动!!!');
        exit();
    }
}

function get_ocr() {
    console.info("你选择了第三方文字识别（OCR）");
    try {
        ocr = plugins.load('com.hraps.ocr');
    } catch (e) {
        console.error('未安装OCR插件，正在跳转浏览器下载\n密码:7faj');
        app.openUrl('https://twelve123.lanzouq.com/b017az0kj');
        exit();
    }
}

function get_PaddleOCR() {
    console.info("你选择了内置飞浆文字识别（OCR）");
    if (typeof (paddle) == "object") {
        console.info("找到内置飞浆调用方法");
    } else {
        console.error("无法找到内置飞浆调用方法");
        exit();
    }
}

var showlog = false;
if (shuangren == true || siren == true || 订阅 != 'a' || tiaozhan) {
    console.show();
    console.setBackgroud("#E6393737");
    console.setLogSize(10);
    if (siren == true || shuangren == true) {
        console.error('正在获取截图权限，并检查ocr配置是否正确');
        if (ocr_model == 2) get_ocr();
        else if (ocr_model == 0) {
            get_PaddleOCR();
        } else if (ocr_model == 1) check_easyedge_ocr();
    }
    console.info('检查每日每周专项题库');
    if (!files.exists(path)) {
        console.error("每日每周专项题库未找到，请在UI页面更新下载!");
        exit();
    }
    delay(2);
    if (whethe) {
        console.info('正在自动静音')
        try {
            device.setMusicVolume(0);
        } catch (e) {
            console.error('权限不足，请给 “允许修改系统设置” 权限');
            console.warn('将尝试跳转到设置页面，赋予权限后请重启脚本');
            delay(2);
            device.setMusicVolume(volume);
        }
    }
    if (tiaozhan || siren || shuangren)
        init();
    if (tiaozhan && !(siren == true || shuangren == true || 订阅 != 'a')) { } //只开了挑战答题的话
    else {
        threads.start(function () {
            if (!requestScreenCapture(false)) {
                toastLog("请求截图失败,脚本结束");
                exit();
            }
        });
        delay(1.5);
        if (textContains("立即开始").exists() || textContains("允许").exists()) {
            if (textContains("立即开始").exists()) {
                textContains("立即开始").className("Button").findOne().click();
            } else {
                textContains("允许").className("Button").findOne().click();
            }
            console.info('自动点击获取权限按键！！！');
        }
        while (true) {
            try {
                captureScreen();
                break;
            } catch (e) {
                console.log('等待截图权限中');
            };
            sleep(1500);
        }
        console.info('立即开始，允许截图权限已获取！！！');
        if (ocr_model == 2) {
            console.time('文字识别');
            console.log('\n测试浩然识别中');
            console.info('\n如果脚本结束，出现红字，则安装错误的OCR位数,卸载安装的OCR插件');
            let text = ocr_api(images.clip(captureScreen(), 0, Math.floor(device.height / 2), device.width, Math.floor(device
                .height / 2)));
            console.timeEnd('文字识别');
            console.log(text);
            console.log("");
        } else if (ocr_model == 0) {
            console.time('文字识别');
            console.log('\n测试内置飞浆识别中');
            let text = paddle_ocr_api(images.clip(captureScreen(), 0, Math.floor(device.height / 2), device.width, Math.floor(
                device.height / 2)));
            console.timeEnd('文字识别');
            console.log(text);
            console.log("");
        } else if (ocr_model == 1) {
            console.time('文字识别');
            console.log('\n测试EasyEdge OCR识别中');
            let text = easyedge_ocr_api(images.clip(captureScreen(), 0, Math.floor(device.height / 2), device.width, Math.floor(
                device.height / 2)));
            console.timeEnd('文字识别');
            console.log(text);
            console.log("");
        }
    }

}

var lCount = 1; //挑战答题轮数
var qCount = 5; //挑战答题每轮答题数

var asub = 2; //订阅数
var aCount = 6; //文章默认学习篇数
var vCount = 6; //小视频默认学习个数
var cCount = 1; //评论次数
var dayCount = 1; // 每日答题
var tzCount = 1; // 挑战答题
var zsyCount = 1; //争上游答题 
var doubleCount = 1; // 双人对战
var meizhou = 1; //每周答题
var zhuanxiang = 1; //专项答题

var aTime = 61; //有效阅读一分钟1分*6
var vTime = 6; //每个小视频学习-5秒
var rTime = 370; //广播收听6分 * 60 = 360秒

var 点点通 = {
    '有效视听': 0,
    '有效浏览': 0,
    '挑战答题': 0
};
var myScores = {}; //分数
var article_list = [];
var delay_time = 1000;
/**
 * @description: 延时函数
 * @param: seconds-延迟秒数s
 * @return: null
 */
function delay(seconds) {
    sleep(1000 * seconds + randomNum(0, 500)); //sleep函数参数单位为毫秒所以乘1000
}
/**
 * @description: 随机秒数
 * @param: seconds-秒数s
 * @return: [seconds+100,seconds+1000]
 */
function random_time(time) {
    return time + random(100, 1000);
}
/**
 * @description: 点击文本控件
 * @param: 文本
 * @return: null
 */
function my_click_clickable(target) {
    text(target).waitFor();
    click(target);
}
/**
 * @description: 生成从minNum到maxNum的随机数
 * @param: minNum-较小的数
 * @param: maxNum-较大的数
 * @return: null
 */
function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
            return 0;
    }
}

/**
 * @description: 文章学习计时(弹窗)函数
 * @param: n-文章标号 seconds-学习秒数
 * @return: null
 */
function article_timing(n, seconds) {
    var seconds = seconds * 1;
    seconds = seconds + randomNum(1, 5);
    h = device.height; //屏幕高
    w = device.width; //屏幕宽
    x = (w / 3) * 2;
    h1 = (h / 6) * 5;
    h2 = (h / 6);
    for (var i = 0; i < seconds; i++) {
        while (!textContains("欢迎发表你的观点").exists()) //如果离开了文章界面则一直等待
        {
            while (status) { console.log("主线程暂停中"); sleep(750); };
            console.error("当前已离开第" + (n + 1) + "文章界面，请重新返回文章页面...");
            delay(2);
        }
        while (status) { console.log("主线程暂停中"); sleep(750); };
        if (i % 5 == 0) //每5秒打印一次学习情况
        {
            console.info("第" + (n + 1) + "篇文章已经学习" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
        }
        sleep(1000);
        if (i % 10 == 0) //每10秒滑动一次，如果android版本<7.0请将此滑动代码删除
        {
            toast("这是防息屏toast,请忽视-。-");
            if (i <= seconds / 2) {
                swipe(x, h1, x, h2, 500); //向下滑动
            } else {
                swipe(x, h2, x, h1, 500); //向上滑动
            }
        }
    }
}

/**
 * @description: 视频学习计时(弹窗)函数
 * @param: n-视频标号 seconds-学习秒数
 * @return: null
 */
function video_timing_bailing(n, seconds) {
    var seconds = seconds * 1;
    seconds = seconds + randomNum(1, 5);
    delay(1);
    for (var i = 0; i < seconds; i++) {
        sleep(1000);
        while (!(textContains("分享").exists() || textContains("播放").exists()) || desc("工作").exists()) //如果离开了百灵小视频界面则一直等待
        {
            while (status) { console.log("主线程暂停中"); sleep(750); };
            console.error("当前已离开第" + (n + 1) + "个视频界面，请重新返回视频");
            delay(2);
        }
        while (status) { console.log("主线程暂停中"); sleep(750); };
        console.info("第" + (n + 1) + "个视频已经观看" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
    }
}

/**
 * @description: 广播学习计时(弹窗)函数
 * @param: r_time-已经收听的时间 seconds-学习秒数
 * @return: null
 */
function radio_timing(r_time, seconds) {
    var seconds = seconds * 1;
    for (var i = 0; i < seconds; i++) {
        sleep(1000);
        if (i % 5 == 0) //每5秒打印一次信息
        {
            console.info("广播已经收听" + (i + 1 + r_time) + "秒,剩余" + (seconds - i - 1) + "秒!");
        }
        if (i % 15 == 0) //每15秒弹一次窗防止息屏
        {
            toast("这是防息屏弹窗，可忽略-. -");
        }
    }
}

/**
 * @description: 已读文章判断
 * @param: null
 * @return: null
 */
function insertLearnedArticle(article) {
    article_list.push(article);
}

function getLearnedArticle(article) {
    for (var i = 0; i < article_list.length; i++) {
        if (article_list[i] == article) {
            return true;
        }
    }
    return false;
}


var commentText = ["歌颂共产党,永远跟党走。", "为中华崛起而读书！", "倡导富强、民主、文明、和谐", "自由，平等，公正，法治", "不忘初心，牢记使命", "努力奋斗，回报祖国！",
    "赞叹中共伟大成就 祝福中国美好未来！"
]; //评论内容，可自行修改，大于5个字便计分
/**
 * @description: 分享评论
 * @param: null
 * @return: null
 */
function collectCommentShare() {
    while (!text("欢迎发表你的观点").exists()) {
        toastLog("需要在文章界面");
        delay(1);
    }/*
    var textOrder = text("欢迎发表你的观点").findOnce().drawingOrder();
        var zhuanOrder = textOrder + 3;
            var shareIcon = className("ImageView").filter(function (iv) {
                return iv.drawingOrder() == zhuanOrder;
            }).findOnce();*/

    toastLog("正在进行评论...");
    /*
        shareIcon.click(); //点击分享
        while (!textContains("分享到学习强").exists()); //等待弹出分享选项界面
        delay(2);
        click("分享到学习强国");
        delay(1);
        toastLog("分享成功!");
        delay(1);
        back(); //返回文章界面
        delay(2);
    */
    //评论

    var num = random(0, commentText.length - 1) //随机数
    click("欢迎发表你的观点");
    delay(1);
    setText(commentText[num]); //输入评论内容
    delay(1);
    click("发布"); //点击右上角发布按钮
    //toastLog("评论成功!");
    delay(2);
    click("删除"); //删除该评论
    delay(2);
    click("确认"); //确认删除
    //toastLog("评论删除成功!");
    delay(2);
    toastLog("评论结束");

    //toastLog("收藏成功!");
    //分享
}


/**
 * @description: 文章学习函数  (阅读文章+文章学习时长)---6+6=12分
 * @param: null
 * @return: null
 */
function articleStudy(x) {
    var aCatlog = '思想'
    while (!desc("工作").exists()); //等待加载出主页
    var listView = className("ListView"); //获取文章ListView控件用于翻页
    if (x == 0) {
        desc("工作").click(); //点击主页正下方的"学习"按钮
        delay(2);
        click(aCatlog);
    }
    delay(2);
    var zt_flag = false; //判断进入专题界面标志
    var fail = 0; //点击失败次数
    var x = aCount;
    if (点点通['有效浏览']) {
        x = Math.max(点点通['有效浏览'] * 6 - (6 - aCount), 点点通['有效浏览'] * 6);
    }
    console.log('需要学习' + x + '篇');
    for (var i = 0, t = 0; i < x;) {
        if (aCount <= 0) aTime = 6;
        try {
            if ((text('播报').findOnce(t).parent().parent().parent().child(0).parent().parent().click()) == true) {
                delay(3);
                // // delay(10); //等待加载出文章页面，后面判断是否进入了视频文章播放要用到
                //获取当前正在阅读的文章标题
                let n = 0;
                while (!textContains("欢迎发表你的观点").exists()) { //如果没有找到评论框则认为没有进入文章界面，一直等待
                    delay(1);
                    console.warn("正在等待加载文章界面...");
                    if (n > 2) { //等待超过3秒则认为进入了专题界面，退出进下一篇文章
                        console.warn("没找到评论框!该界面非文章界面!");
                        zt_flag = true;
                        break;
                    }
                    n++;
                }
                if (text("展开").exists()) { //如果存在“展开”则认为进入了文章栏中的视频界面需退出
                    console.warn("进入了视频界面，退出并进入下一篇文章!");
                    t++;
                    back();
                    listView.scrollForward();
                    delay(1.5);
                    if (rTime != 0) {
                        while (!desc("工作").exists());
                        console.info("因为广播被打断，重新收听广播...");
                        delay(0.5);
                        listenToRadio(); //听电台广播
                        while (!desc("工作").exists());
                        desc("工作").click();
                    }
                    delay(2);
                    continue;
                }
                if (zt_flag == true) { //进入专题页标志
                    console.warn("进入了专题界面，即将退出并进下一篇文章!");
                    t++;
                    back();
                    delay(2);
                    zt_flag = false;
                    continue;
                }
                var currentNewsTitle = ""
                if (id("xxqg-article-header").exists()) {
                    currentNewsTitle = id("xxqg-article-header").findOne().child(0).text(); // 最终解决办法
                } else if (textContains("来源").exists()) {
                    currentNewsTitle = textContains("来源").findOne().parent().children()[0].text();
                } else if (textContains("作者").exists()) {
                    currentNewsTitle = textContains("作者").findOne().parent().children()[0].text();
                } else if (descContains("来源").exists()) {
                    currentNewsTitle = descContains("来源").findOne().parent().children()[0].desc();
                } else if (descContains("作者").exists()) {
                    currentNewsTitle = descContains("作者").findOne().parent().children()[0].desc();
                } else {
                    console.log("无法定位文章标题,即将退出并阅读下一篇")
                    t++;
                    back();
                    delay(2);
                    continue;
                }
                if (currentNewsTitle == "") {
                    console.log("标题为空,即将退出并阅读下一篇")
                    t++;
                    back();
                    delay(2);
                    continue;
                }
                var flag = getLearnedArticle(currentNewsTitle);
                if (flag) {
                    //已经存在，表明阅读过了
                    console.info("该文章已经阅读过，即将退出并阅读下一篇");
                    t++;
                    back();
                    delay(2);
                    continue;
                } else {
                    //没阅读过，添加到数据库
                    insertLearnedArticle(currentNewsTitle);
                }
                console.log("正在学习第" + (i + 1) + "篇文章,标题：", currentNewsTitle);
                fail = 0; //失败次数清0
                //开始循环进行文章学习
                article_timing(i, aTime);
                aCount--;
                delay(2);/*
                if (sCount != 0) {
                    console.info("第" + (3 - sCount) + "次分享开始");
                    sCount--;
                    collectCommentShare(); //评论和分享
                }*/
                if (cCount != 0) {
                    cCount--;
                    collectCommentShare(); //评论
                }
                back(); //返回主界面
                console.info('返回主界面');
                delay(0.3);
                while (!desc("工作").exists()) { //等待加载出主页
                    console.info("等待加载主页");
                    delay(2);
                }
                delay(2);
                //console.info('i++，t++')
                listView.scrollForward();
                delay(1)
                i++;
                t++; //t为实际点击的文章控件在当前布局中的标号,和i不同,勿改动!
            } else {
                t++;
            }
        } catch (e) {
            listView.scrollForward();
            //console.info('异常')
            t = 0;
            delay(1.5);
        }
    }
    aTime = 61;
}

/**
 * @description:百灵小视频学习函数
 * @param: null
 * @return: null
 */
function videoStudy_news(tmp) {
    h = device.height; //屏幕高
    w = device.width; //屏幕宽
    x = (w / 3) * 2;
    h1 = (h / 6) * 5;
    h2 = (h / 6);
    //delay(1)
    if (tmp == 1) {
        desc("工作").click();
        delay(2)
        click("百灵");
        delay(1)
    }
    click("推荐");
    delay(2);
    //获取listView视频列表控件用于翻页
    var v = className('android.widget.FrameLayout').clickable(true).depth(24).findOne().bounds();
    press(v.centerX(), v.centerY(), 150);
    delay(1);
    //var listView = className("ListView"); 
    for (var i = 0; i < vCount;) {
        if (textContains("分享").exists()) {
            console.log("即将学习第" + (i + 1) + "个视频!");
            video_timing_bailing(i, vTime); //学习每个新闻联播小片段
            //back();//返回联播频道界面
            swipe(x, h1, x, h2, 500); // 下滑动
            delay(1);
            i++;
        } else {
            delay(1);
            console.error("等待百灵视频界面");
        }
    }
    delay(2);
    back();
}

function new_bailing_video(tmp) {
    h = device.height; //屏幕高
    w = device.width; //屏幕宽
    x = (w / 3) * 2;
    h1 = (h / 6) * 5;
    h2 = (h / 6);
    //delay(1)
    if (tmp == 1) {
        desc("工作").click();
        delay(2)
        click("百灵");
        delay(1)
    }
    for (var i = 0; i < vCount;) {
        if (textContains("百灵").exists()) {
            try {
                if (i % 2 == 0) {
                    click("推荐");
                    delay(2);
                }
                className('android.widget.FrameLayout').clickable(true).depth(22).findOnce((i % 2)).click();
                console.log("即将学习第" + (i + 1) + "个视频!");
                video_timing_bailing(i, vTime); //学习每个新闻联播小片段
                back(); //返回联播频道界面
                delay(1);
                i++;
            } catch (e) {
                delay(1);
                console.error("等待百灵视频界面");
            }

        } else {
            delay(1);
            console.error("等待百灵视频界面");
        }

    }
}

function video_news_time(n, seconds) {
    var seconds = seconds * 1;
    seconds = seconds + randomNum(1, 5);
    for (var i = 0; i < seconds; i++) {
        sleep(1000);
        while (!desc("工作").exists()) //如果离开了看电视视频界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "个视频界面，请重新返回视频");
            delay(2);
        }
        console.info("第" + (n + 1) + "个视频已经观看" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
    }
}

/**
 * @description:电视台视频学习
 * @param: null
 * @return: null
 */
function video_news(tmp) {
    h = device.height; //屏幕高
    w = device.width; //屏幕宽
    x = (w / 3) * 2;
    h1 = (h / 6) * 5;
    h2 = (h / 6);
    //delay(1)
    var t = 6;
    if (tmp == 1) {
        desc("工作").click();
        delay(2);
        click("电视台");
        delay(1)
        click("看电视");
        delay(2);
        t = 0;
    }
    var s = textContains("中央广播电视总台").depth(22).findOnce().parent();
    s.click();
    console.info('改变提示框位置');
    delay(1);
    console.setPosition(device.width / 4, -device.height / 4);
    for (var i = 0; i < vCount; i++) {
        if (textContains("电视台").exists()) {
            console.log("即将学习第" + (i + 1) + "个视频!");
            var cctv = s.parent().parent().parent().parent().child(1).child(0).child(t).bounds();
            press(cctv.centerX(), cctv.centerY(), 150);
            delay(2);
            video_news_time(i, vTime); //学习每个直播小片段
            delay(1);
            t++;
            t = t % 8;
        } else {
            delay(1);
            console.error("等待电视台->看电视界面");
        }
    }
    console.setPosition(0, device.height / 2);
    delay(2);
    //back();
}

/**
 * @description: 听“电台”新闻广播函数  (视听学习+视听学习时长)---6+6=12分
 * @param: null
 * @return: null
 */
function listenToRadio() {
    click("电台");
    delay(1);
    click("听广播");
    delay(2);
    while (!(textContains("正在收听").exists() || textContains("最近收听").exists() || textContains("推荐收听").exists())) {
        log("等待加载");
        delay(1);
    }
    if (click("最近收听") == 0) {
        if (click("推荐收听") == 0) {
            click("正在收听");
        }
    }
    delay(2);
    if (id("btn_back").findOne().click() == 0) {
        delay(2);
        back(); //返回电台界面
    }
    delay(2);

}

/**
 * @description: 启动app
 * @param: null
 * @return: null
 */
function start_app() {
    console.setPosition(0, device.height / 2); //部分华为手机console有bug请注释本行
    console.show(); //部分华为手机console有bug请注释本行
    console.setBackgroud("#E6393737");
    console.setLogSize(10);
    console.log("正在启动app...");
    if (!(launchApp("学习强国") || launch('cn.xuexi.android'))) //启动学习强国app
    {
        console.error("找不到学习强国App!，请自己尝试打开");
        // return;
    }
    while (!desc("工作").exists()) {
        console.log("正在等待加载出主页，如果一直加载此信息，请检测是否在主界面，或者无障碍服务可能出现BUG，请停止运行hamibot重新给无障碍服务");
        if (textContains("取消").exists() && textContains("立即升级").exists()) {
            //toast('1');
            text("取消").click();
        }
        delay(3);
    }
    delay(1);
}

/**
 * @description: 本地频道
 * @param: null
 * @return: null
 */
function localChannel() {
    var i = false;
    delay(1)
    while (!desc("工作").exists()); //等待加载出主页
    desc("工作").click();
    sleep(random_time(delay_time));
    console.log("点击本地频道");
    if (text("思想").exists()) {
        delay(1);
        text("思想").findOne().parent().parent().child(3).click();
        delay(3);
        // className("android.support.v7.widget.RecyclerView").findOne().child(2).click();
        className("android.support.v7.widget.RecyclerView").findOne().children().forEach(child => {
            if (i) return;
            var target = child.findOne(className("android.widget.ImageView"));
            var target_b = target.bounds();
            console.log(target_b);
            click(target_b.centerX(), target_b.centerY());
            i = true;
        });
        delay(2);
        console.log("返回主界面");
        back();
        launchApp("学习强国");
        delay(1);
        text("思想").findOne().parent().parent().child(0).click();
    } else {
        console.log("请手动点击本地频道！");
    }

}

/**
 * @description: 获取积分
 * @param: null
 * @return: null
 **/
function getScores(i) {
    while (!desc("工作").exists()); //等待加载出主页
    console.log("正在获取积分...");
    delay(2);
    while (!text("积分明细").exists()) {
        if (id("comm_head_xuexi_score").exists()) {
            id("comm_head_xuexi_score").findOnce().click();
        } else if (text("积分").exists()) {
            text("积分").findOnce().parent().child(1).click();
        }
        delay(3);
    }
    while (!text('登录').exists()) {
        delay(0.5);
    }
    let err = false;
    while (!err) {
        try {
            className("android.widget.ListView").findOnce().children().forEach(item => {
                var name;
                try {
                    name = item.child(0).child(0).text();
                } catch (e) {
                    name = item.child(0).text();
                }
                let str = item.child(2).text().split("/");
                let score = str[0].match(/[0-9][0-9]*/g);
                myScores[name] = score;
            });
            err = true;
        } catch (e) {
            console.log(e);
        }
    }
    if (i == 3) {
        var score = textContains("今日已累积").findOne().text();
        score += '%0A四人赛：' + myScores["四人赛"] + '分';
        score += '%0A双人赛：' + myScores["双人对战"] + '分';
        score += '%0A成长总积分：' + textContains("成长总积分").findOne().parent().child(3).text() + '分%0A';
        log(score);
        back();
        return score;
    }
    console.log(myScores);

    aCount = Math.ceil((12 - myScores["我要选读文章"]) / 2); //文章个数
    if (i == 1) {
        console.info("检查阅读文章是否满分！")
        aCount = 12 - myScores["我要选读文章"];
        if (aCount != 0) {
            console.log("还需要阅读：" + aCount.toString() + "篇！");
        } else {
            console.info("已满分！");
        }
        delay(1);
        back();
        delay(1);
        return;
    }
    if (i == 2) {
        console.info("检查视频是否满分！")
        vCount = 6 - myScores["视听学习"];
        if (vCount != 0) {
            console.log("还需要观看：" + vCount.toString() + "篇！");
        } else {
            console.info("已满分！");
        }
        delay(1);
        back();
        delay(1);
        return;
    }
    if (aCount != 0) {
        aCount = aCount;
    }
    vCount = 6 - myScores["视听学习"];
    rTime = (6 - myScores["视听学习时长"]) * 60;
    asub = 2 - myScores["订阅"];
    // sCount = 2 - myScores["分享"] * 2
    cCount = 1 - myScores["发表观点"];
    if (myScores["每日答题"] < 5) dayCount = 1;
    else dayCount = 0;
    if (myScores["挑战答题"] < 5) tzCount = 1;
    else tzCount = 0;
    if (myScores["四人赛"] == 0) zsyCount = 1;
    else zsyCount = 0;
    if (myScores["双人对战"] == 0) doubleCount = 1;
    else doubleCount = 0;
    if (myScores["每周答题"] == 0) meizhou = 1;
    else meizhou = 0;
    if (myScores["专项答题"] == 0) zhuanxiang = 1;
    else zhuanxiang = 0;

    console.log('评论：' + cCount.toString() + '个')
    /// console.log('分享：' + sCount.toString() + '个')
    console.log('订阅：' + asub.toString() + '个')
    console.log('剩余文章：' + aCount.toString() + '篇')
    console.log('剩余视频：' + vCount.toString() + '个')
    console.log('剩视听学习时长：' + rTime.toString() + '秒')
    console.log('每日答题：\t' + dayCount.toString());
    console.log('挑战答题：\t' + tzCount.toString());
    console.log('四人赛：\t' + zsyCount.toString());
    console.log('双人对战：\t' + doubleCount.toString());
    if (meizhou_txt == "开启")
        console.log('每周答题：\t' + meizhou.toString());
    console.error("每周答题已不再更新新题！");
    if (zhuanxiang_txt == "开启")
        console.log('专项答题：\t' + zhuanxiang.toString());

    delay(1);
    back();
    delay(1);
}

/**
@description: 停止广播
@param: null
@return: null
*/
function stopRadio() {
    console.log("停止收听广播！");
    click("电台");
    delay(1);
    click("听广播");
    delay(2);
    back_table();
    while (!(textContains("正在收听").exists() || textContains("最近收听").exists() || textContains("推荐收听").exists())) {
        log("等待加载");
        delay(2)
    }
    if (click("正在收听") == 0) {
        click("最近收听");
    }
    delay(3);
    id("v_play").findOnce(0).click();
    delay(2)
    if (id("btn_back").findOne().click() == 0) {
        delay(2);
        back();
    }
    delay(2);
    try {
        if (id("v_playing").exists())
            id("v_playing").findOnce(0).click();
    } catch (e) { }

}

/**
@description: 学习平台订阅
@param: null
@return: null
*/
function pic_click(a, b, s1) {
    while (asub > 0) {
        let result = findColor(captureScreen(), '#E42417', {
            max: 5,
            region: [s1, 100, device.width - s1, device.height - 200], //区域
            threshold: 10,
        });
        if (result) {
            console.log("已经订阅了" + (3 - asub) + "个");
            press(result.x + a, result.y + b, 100);
            asub--;
        } else {
            break;
        }
        delay(1);
    }
}

function sub() {
    console.info('正在订阅');
    h = device.height; //屏幕高
    w = device.width; //屏幕宽
    x = (w / 3) * 2;
    h1 = (h / 6) * 5;
    h2 = (h / 6);
    desc("工作").click();
    delay(1);
    click("订阅");
    delay(1);
    click("添加");
    delay(3);
    if (!desc('推荐').exists()) {
        console.info('没有找到，可能你的xxqg不是2.33及以下版本，不支持订阅！！！');
        back();
        delay(1);
        back_table();
        return 0;
    }
    var len = desc('推荐').depth(15).findOne().parent();
    var s1 = className("android.view.View").depth(14).scrollable(true).findOne().child(0).child(2).bounds().left;
    var old_names = '';
    console.log('搜索中');
    for (var i = 0; i < len.childCount() - 1 && asub != 0; i++) {
        if (订阅 == 'c') i = 1;
        len.child(i).click();
        delay(1);
        while (true && asub != 0) {
            pic_click(20, 20, s1);
            swipe(x, h1, x, h2, random(800, 1200)); // 下滑动
            delay(1);
            pic_click(20, 20, s1);
            swipe(x, h1, x, h2, random(800, 1200)); // 下滑动
            delay(1);
            try {
                var list = className("android.view.View").depth(14).findOnce(1);
                var names = list.child(2).child(1).desc(); //看第二个
                if (names == old_names) {
                    break;
                } else old_names = names;
            } catch (e) {
                if (list != null && list.childCount() < 5) break;
            }
            //toastLog(names);
        }
        if (订阅 == 'c') break;
    }
    if (asub == 0) {
        back();
        delay(1);
        back_table();
        console.info('订阅完成');
        return 0;
    }
    desc('地方平台\nTab 2 of 2').click();
    delay(2);
    len = desc('推荐').depth(15).findOne().parent();
    list = className("android.view.View").depth(14).scrollable(true).findOne();
    old_names = '';
    for (var i = 0; i < len.childCount() - 1 && asub != 0; i++) {
        if (订阅 == 'c') i = 1;
        len.child(i).click();
        delay(1);
        while (true && asub != 0) {
            pic_click(20, 20, s1);
            swipe(x, h1, x, h2, random(800, 1200)); // 下滑动
            delay(1);
            pic_click(20, 20, s1);
            swipe(x, h1, x, h2, random(800, 1200)); // 下滑动
            delay(1);
            try {
                var list = className("android.view.View").depth(14).findOnce(1);
                var names = list.child(2).child(1).desc();
                if (names == old_names) {
                    break;
                } else old_names = names;
            } catch (e) {
                if (list != null && list.childCount() < 5) break;
            }
        }
        if (订阅 == 'c') break;
    }
    if (asub == 0) {
        console.info('订阅完成');
    } else {
        console.info('订阅结束,已经没有订阅的了');
    }
    back();
    delay(1);
    back_table();
}

function questionShow() {
    while (!desc("工作").exists()) {
        console.log("等待加载出主页");
        delay(1);
        if (text("排行榜").exists()) {
            return;
        }
    }
    console.log("当前在主界面")
    if (text("我的").exists()) {
        text("我的").click();
        console.log("点击我的");
    }
    delay(1);
    while (!desc("我的信息").exists()) {
        console.log("等待 我的 界面");
        delay(1);
    }
    console.log("点击我要答题");
    text("我要答题").findOne().parent().click();
    delay(1);
}

function meizhouAnswer() {
    h = device.height; //屏幕高
    w = device.width; //屏幕宽
    x = (w / 3) * 2;
    h1 = (h / 6) * 5;
    h2 = (h / 6);
    while (!text("排行榜").exists()) {
        console.info("等待我要答题界面");
        delay(1);
    }
    var textOrder = text("排行榜").findOnce().parent();
    while (text("排行榜").exists()) {
        console.info("点击每周答题");
        textOrder.child(3).click();
        delay(1);
    }
    delay(3);
    var t = 0;
    while (true) {
        while (status) { console.log("主线程暂停中"); sleep(750); };
        if (text('未作答').exists()) {
            text("未作答").findOne().parent().click();
            dailyAnswer();
            break;
        } else {
            if (每周答题下滑 == 'a') {
                console.info("没有可答题的题目，返回");
                back();
                delay(1);
                if (text("已作答").exists()) { // 防止出现网络卡顿
                    back();
                    delay(1);
                }
                break;
            } else {
                if (textContains('您已经看到了我的底线').exists()) {
                    console.log("已经没有可答题的题目了，返回");
                    back();
                    delay(1);
                    break;
                }
                swipe(x, h1, x, h2, 100); // 下滑动
                try {
                    textContains("月").findOnce(0).parent().parent().parent().scrollForward();
                } catch (e) { }
                delay(1);
                if (t % 10 == 0)
                    console.log("向下滑动中！！！");
                t++;
            }
        }
    }

}

function zhuanxiangAnswer() {
    h = device.height; //屏幕高
    w = device.width; //屏幕宽
    x = (w / 3) * 2;
    h1 = (h / 6) * 5;
    h2 = (h / 6);
    while (!text("排行榜").exists()) {
        console.info("等待我要答题界面");
        delay(1);
    }
    var textOrder = text("排行榜").findOnce().parent();
    while (text("排行榜").exists()) {
        console.info("点击专项答题");
        textOrder.child(4).click();
        delay(1);
    }
    delay(3);
    var t = 0;

    while (true) {
        if (text("继续答题").exists() || text("开始答题").exists()) {
            if (text("继续答题").exists())
                text("继续答题").findOne().click();
            else if (text("开始答题").exists())
                text("开始答题").findOne().click();
            delay(1);
            dailyAnswer();
            break;
        } else {
            if (专项答题下滑 == 'a') {
                console.log('没有可答题的题目，返回');
                back();
                delay(1);
                if (text("已满分").exists() || text("继续答题").exists() || text("开始答题").exists()) { // 防止出现网络卡顿
                    back();
                    delay(1);
                }
                break;
            } else {
                if (textContains('您已经看到了我的底线').exists()) {
                    console.log("已经没有可答题的题目了，返回");
                    back();
                    delay(1);
                    break;
                }
                swipe(x, h1, x, h2, 100); // 下滑动
                try {
                    textContains("专项").findOnce(0).parent().scrollForward();
                } catch (e) { }

                //delay(1);
                if (t % 10 == 0)
                    console.log("向下滑动中！！！");
                t++;
            }
        }
    }
}


/**
 * @description: 获取填空题题目数组
 * @param: null
 * @return: questionArray
 */
function getFitbQuestion() {
    var questionCollections = className("EditText").findOnce().parent().parent();
    var questionArray = [];
    var findBlank = false;
    var blankCount = 0;
    var blankNumStr = "";
    var i = 0;
    questionCollections.children().forEach(item => {
        if (item.className() != "android.widget.EditText") {
            if (item.text() != "") { //题目段
                if (findBlank) {
                    blankNumStr = "|" + blankCount.toString();
                    questionArray.push(blankNumStr);
                    findBlank = false;
                }
                questionArray.push(item.text());
            } else {
                findBlank = true;
                blankCount = (className("EditText").findOnce(i).parent().childCount() - 1);
                i++;
            }
        }
    });
    return questionArray;
}

/**
 * @description: 获取选择题题目数组
 * @param: null
 * @return: questionArray
 */
function getChoiceQuestion() {
    var questionCollections = className("ListView").findOnce().parent().child(1);
    var questionArray = [];
    questionArray.push(questionCollections.text());
    return questionArray;
}

/**
 * @description: 获取提示字符串
 * @param: null
 * @return: tipsStr
 */
function getTipsStr() {
    var tipsStr = "";
    while (tipsStr == "") {
        if (text("查看提示").exists()) {
            var seeTips = text("查看提示").findOnce();
            seeTips.click();
            delay(1);
            click(device.width * 0.5, device.height * 0.41);
            delay(1);
            click(device.width * 0.5, device.height * 0.35);
        } else {
            console.error("未找到查看提示");
        }
        if (text("提示").exists()) {
            var tipsLine = text("提示").findOnce().parent();
            //获取提示内容
            var tipsView = tipsLine.parent().child(1).child(0);
            tipsStr = tipsView.text();
            //关闭提示
            tipsLine.child(1).click();
            break;
        }
        delay(1);
    }
    return tipsStr;
}

/**
 * @description: 从提示中获取填空题答案
 * @param: timu, tipsStr
 * @return: ansTips
 */
function getAnswerFromTips(timu, tipsStr) {
    var ansTips = "";
    for (var i = 1; i < timu.length - 1; i++) {
        if (timu[i].charAt(0) == "|") {
            if (timu[i].charAt(0) == "|") {
                var blankLen = timu[i].substring(1);
                var s = timu[i - 1].substr(Math.max(0, timu[i - 1].length - 12), 12);
                var indexKey = tipsStr.indexOf(s) + s.length;
                var ansFind = tipsStr.substr(indexKey, blankLen);
                ansTips += ansFind;
            }
        }
    }
    return ansTips;
}

/**
 * @description: 根据提示点击选择题选项
 * @param: tipsStr
 * @return: clickStr
 */
function clickByTips(tipsStr) {
    var clickStr = "";
    var isFind = false;
    if (className("ListView").exists()) {
        var listArray = className("ListView").findOne().children();
        listArray.forEach(item => {
            var ansStr = item.child(0).child(2).text();
            if (tipsStr.indexOf(ansStr) >= 0) {
                item.child(0).click();
                clickStr += item.child(0).child(1).text().charAt(0);
                isFind = true;
            }
        });
        if (!isFind) { //没有找到 点击第一个
            console.info("没有找到 点击第一个");
            listArray[0].child(0).click();
            clickStr += listArray[0].child(0).child(1).text().charAt(0);
        }
    }
    return clickStr;
}

/**
 * @description: 根据答案点击选择题选项
 * @param: answer
 * @return: null
 */
function clickByAnswer(answer) {
    var click_true = false;
    if (className("ListView").exists()) {
        var listArray = className("ListView").findOnce().children();
        listArray.forEach(item => {
            var listIndexStr = item.child(0).child(1).text().charAt(0);
            //单选答案为非ABCD
            var listDescStr = item.child(0).child(2).text();
            if (answer.indexOf(listIndexStr) >= 0 || answer == listDescStr) {
                item.child(0).click();
                click_true = true;
            }
        });
    }
    if (!click_true) {
        console.error('没有找到选项，选A跳过');
        className("ListView").findOnce().child(0).child(0).click();
    }
}

/**
 * @description: 检查答案是否正确
 * @param: question, ansTiku, answer
 * @return: null
 */
function checkAndUpdate(question, ansTiku, answer) {
    sleep(500);
    if (textContains("答案解析").exists()) { //答错了
        swipe(device.width / 2, device.height - 200, 100, 100, 500);
        if (text("确定").exists()) {
            text("确定").click();
        } else if (textContains('下一题').exists()) {
            textContains('下一题').click();
        } else if (className("Button").exists()) {
            className("Button").findOnce().click();
        } else {
            click(device.width * 0.85, device.height * 0.06);
        }
    }
}

function daily_Answer(question, table_name) {
    try {
        var db = SQLiteDatabase.openOrCreateDatabase(path, null);
        sql = "SELECT answer FROM " + table_name + " WHERE question LIKE '" + question + "%'"
        var cursor = db.rawQuery(sql, null);
        if (cursor.moveToFirst()) {
            var answer = cursor.getString(0);
            cursor.close();
            return answer;
        } else {
            cursor.close();
            return '';
        }
    } catch (e) {
        return '';
    }

}
/**
 * @description: 每日答题循环
 * @param: null
 * @return: null
 */
function dailyQuestionLoop() {
    while (true) {
        if (textStartsWith("填空题").exists()) {
            var questionArray = getFitbQuestion();
            break;
        } else if (textStartsWith("多选题").exists() || textStartsWith("单选题").exists()) {
            var questionArray = getChoiceQuestion();
            break;
        } else if (text("再来一组").exists() || text("查看解析").exists() || text("再练一次").exists()) {
            console.info("答题已结束"); //答题结束
            break;
        }
        log('等待题目出现');
        delay(1);
    }
    if (text("再来一组").exists() || text("查看解析").exists() || text("再练一次").exists()) return;
    while (status) { console.log("主线程暂停中"); sleep(750); };
    var blankArray = [];
    var question = "";
    questionArray.forEach(item => {
        if (item != null && item.charAt(0) == "|") { //是空格数
            blankArray.push(item.substring(1));
        } else { //是题目段
            question += item;
        }
    });
    question = question.replace(/\s/g, "");
    console.log("题目：" + question);

    var ansTiku = daily_Answer(question, 'tiku');

    if (ansTiku.length == 0) { //tiku表中没有则到tikuNet表中搜索答案
        ansTiku = daily_Answer(question, 'tikuNet');
    }
    var answer = ansTiku.replace(/(^\s*)|(\s*$)/g, "");
    // getAnswer(question);

    if (textStartsWith("填空题").exists()) {
        if (answer == "") {
            var tipsStr = getTipsStr();
            answer = getAnswerFromTips(questionArray, tipsStr);
            console.info("提示中的答案：" + answer);
            if (answer == '') {
                answer = '没有找到提示';
                console.error("未找到答案");
            }
            setText(0, answer.substr(0, blankArray[0]));
            if (blankArray.length > 1) {
                for (var i = 1; i < blankArray.length; i++) {
                    setText(i, answer.substr(blankArray[i - 1], blankArray[i]));
                }
            }
        } else {
            console.info("答案：" + answer);
            setText(0, answer.substr(0, blankArray[0]));
            if (blankArray.length > 1) {
                for (var i = 1; i < blankArray.length; i++) {
                    setText(i, answer.substr(blankArray[i - 1], blankArray[i]));
                }
            }
        }
    } else if (textStartsWith("多选题").exists() || textStartsWith("单选题").exists()) {
        if (answer == "") {
            var tipsStr = getTipsStr();
            answer = clickByTips(tipsStr);
            console.info("提示中的答案：" + answer);
        } else {
            console.info("答案：" + answer);
            clickByAnswer(answer);
        }
    }

    delay(1);

    if (text("确定").exists()) {
        text("确定").click();
        delay(0.5);
    } else if (text("下一题").exists()) {
        click("下一题");
        delay(0.5);
    } else if (text("完成").exists()) {
        text("完成").click();
        delay(0.5);
    } else {
        console.warn("未找到右上角确定按钮控件，根据坐标点击(可能是模拟器)");
        click(device.width * 0.85, device.height * 0.06); //右上角确定按钮，根据自己手机实际修改
    }
    while (status) { console.log("主线程暂停中"); sleep(750); };
    checkAndUpdate(question, ansTiku, answer);
    console.log("------------");
    delay(2);
}

function click_answer(answer) {
    var f = true;
    if (className("ListView").exists()) {
        if (textStartsWith("多选题").exists()) {
            var listArray = className("ListView").findOnce().children();
            listArray.forEach(item => {
                var listIndexStr = item.child(0).child(2).text();
                var num = 0;
                for (var i = 0; i < listIndexStr.length; i++) {
                    if (answer.indexOf(listIndexStr[i]) != -1) {
                        num++;
                    }
                }
                if (num / listIndexStr.length > 1 / 2) {
                    item.child(0).click();
                    f = false;
                }
            });
        } else {
            var listArray = className("ListView").findOnce().children();
            listArray.forEach(item => {
                var listIndexStr = item.child(0).child(2).text();
                if (answer.indexOf(listIndexStr) != -1) {
                    item.child(0).click();
                    f = false;
                    return;
                }
            });
            if (f) {
                var a = 0;
                var num = 0;
                var ch = 0;
                listArray.forEach(item => {
                    var maxx = 0;
                    var listIndexStr = item.child(0).child(2).text();
                    for (var i = 0; i < listIndexStr.length; i++) {
                        if (answer.indexOf(listIndexStr[i]) != -1) {
                            maxx++;
                        }
                    }
                    if (maxx > num) {
                        num = maxx;
                        ch = a;
                    }
                    a++;
                });
                className("ListView").findOnce().child(ch).child(0).click();
                f = false;
            }

        }
        if (f) {
            if (textContains('A').exists()) {
                textContains('A').click();
            }
            console.error('没有找到,选A跳过');
        }
    }
}
/**
 * @description: 每日答题
 * @param: null
 * @return: null
 */
function dailyAnswer() {
    while (status) { console.log("主线程暂停中"); sleep(750); };
    console.info("开始答题");
    console.setPosition(0, 0);
    delay(1);
    let dlNum = 0; //每日答题轮数
    var flag = true;
    if (textStartsWith("填空题").exists() || textStartsWith("多选题").exists() || textStartsWith("单选题").exists()) {
        flag = false;
    }
    if (flag) {
        var s = 1;
        while (!text("排行榜").exists()) {
            console.log("等待我要答题界面");
            delay(1)
            if ((textStartsWith("填空题").exists() || textStartsWith("多选题").exists() || textStartsWith("单选题").exists())) {
                s = 0;
                break;
            }
        }
        if (s == 1) {
            var textOrder = text("排行榜").findOnce().parent();
            while (!className(textOrder.child(2).className()).exists()) {
                toastLog("等待界面出现");
            }
            textOrder.child(2).click();
        }
    }
    delay(0.5);
    while (true) {
        delay(2);
        while (status) { console.log("主线程暂停中"); sleep(750); };
        dailyQuestionLoop();
        if (text("再练一次").exists()) {
            delay(1.5);
            while (status) { console.log("主线程暂停中"); sleep(750); };
            console.log("每周答题结束！");
            text("返回").click();
            delay(2);
            back();
            break;
        } else if (text("查看解析").exists()) {
            delay(1.5);
            while (status) { console.log("主线程暂停中"); sleep(750); };
            console.log("专项答题结束！");
            back();
            delay(0.5);
            back();
            delay(0.5);
            break;
        } else if (text("再来一组").exists()) {
            delay(2);
            dlNum++;
            if (!text("领取奖励已达今日上限").exists()) {
                text("再来一组").click();
                console.warn("第" + (dlNum + 1).toString() + "轮答题:");
                delay(1);
            } else {
                delay(1.5);
                while (status) { console.log("主线程暂停中"); sleep(750); };
                console.log("每日答题结束！")
                text("返回").click();
                delay(2);
                break;
            }
        }
    }
    console.setPosition(0, device.height / 2);
}

////////////////////////////挑战答题模块功能////////////////////////
/**
 * @description: 从数据库中搜索答案
 * @param: question 问题
 * @return: answer 答案
 */
function getAnswer(question) {
    var question1 = question.split('来源：')[0]; //去除来源
    question1 = question1.replace(/ /g, ''); //再删除多余空格
    question1 = question1.replace(/  /g, '');
    try {
        var option = '';
        var similars = 0;
        var pos = -1;
        for (var i = 0; i < question_list.length; i++) {
            var s = similarity(question_list[i][0], '', question1, 0);
            if (s > similars) {
                similars = s;
                pos = i;
            }
        }
        option = question_list[pos][1];
        var ans = question_list[pos][2].split('	')[option[0].charCodeAt(0) - 65];
        if (!ans) return 'A';
        return ans;
    } catch (e) {
        return "A";
    }

}

function indexFromChar(str) {
    return str.charCodeAt(0) - "A".charCodeAt(0);
}

/**
 * @description: 每次答题循环
 * @param: conNum 连续答对的次数
 * @return: null
 */
function challengeQuestionLoop(conNum) {
    let ClickAnswer; //定义已点击答案
    if (conNum >= qCount) //答题次数足够退出，每轮qCount=5+随机1-3次
    {
        let listArray = className("ListView").findOnce().children(); //题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("本轮答题数足够，随机点击答案");
        while (status) { console.log("主线程暂停中"); sleep(750); };
        var question = className("ListView").findOnce().parent().child(0).text();
        question = question.replace(/\s/g, "");
        var options = []; //选项列表
        if (className("ListView").exists()) {
            className("ListView").findOne().children().forEach(child => {
                var answer_q = child.child(0).child(1).text();
                options.push(answer_q);
            });
        } else {
            console.error("答案获取失败!");
            return;
        }
        console.log((conNum + 1).toString() + ".随机点击题目：" + question);
        delay(random(0.5, 1)); //随机延时0.5-1秒
        listArray[i].child(0).click(); //随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();; //记录已点击答案
        console.log("随机点击:" + ClickAnswer);
        delay(0.5); //等待0.5秒，是否出现X
        console.log("---------------------------");
        return;
    }
    if (className("ListView").exists()) {
        while (status) { console.log("主线程暂停中"); sleep(750); };
        var question = className("ListView").findOnce().parent().child(0).text();
    } else {
        console.error("提取题目失败!");
        let listArray = className("ListView").findOnce().children(); //题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("随机点击");
        delay(random(0.5, 1)); //随机延时0.5-1秒
        listArray[i].child(0).click(); //随意点击一个答案
        return;
    }
    var chutiIndex = question.lastIndexOf("出题单位");
    if (chutiIndex != -1) {
        question = question.substring(0, chutiIndex - 2);
    }
    while (status) { console.log("主线程暂停中"); sleep(750); };
    //question = question.replace(/\s/g, "");
    var options = []; //选项列表
    if (className("ListView").exists()) {
        className("ListView").findOne().children().forEach(child => {
            var answer_q = child.child(0).child(1).text();
            options.push(answer_q);
        });
    } else {
        console.error("答案获取失败!");
        return;
    }
    console.log((conNum + 1).toString() + ".题目：" + question);
    var answer = getAnswer(question);
    console.info("答案：" + answer);
    if (/^[a-zA-Z]{1}$/.test(answer)) { //如果为ABCD形式
        var indexAnsTiku = indexFromChar(answer.toUpperCase());
        answer = options[indexAnsTiku];
        toastLog(answer);
    }
    let hasClicked = false;
    while (status) { console.log("主线程暂停中"); sleep(750); };
    let listArray = className("ListView").findOnce().children(); //题目选项列表
    if (answer == "") //如果没找到答案
    {
        let i = random(0, listArray.length - 1);
        console.error("没有找到答案，随机点击");
        delay(random(0.5, 1)); //随机延时0.5-1秒
        listArray[i].child(0).click(); //随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();; //记录已点击答案
        hasClicked = true;
        console.log("随机点击:" + ClickAnswer); //如果随机点击答案正确，则更新到本地题库tiku表
        delay(0.5); //等待0.5秒，是否出现X
        console.log("---------------------------");
    } else //如果找到了答案
    {
        var ii = 1;
        var iii = 1;
        listArray.forEach(items => {
            try {
                console.info('选项' + ii + '：' + items.child(0).child(1).text());
            } catch (e) { while (status) { console.log("主线程暂停中"); sleep(750); }; }
            ii++;
        });
        listArray.forEach(item => {
            try {
                var listDescStr = item.child(0).child(1).text();
                var answer_replace = answer.replace(/\ +/g, ""); //去掉空格方法
                answer_replace = answer_replace.replace(/[ ]/g, ""); //去掉空格
                answer_replace = answer_replace.replace(/[\r\n]/g, ""); //去掉回车换行
                answer_replace = answer_replace.replace(/-/g, ""); //去掉"-"号
                var listDescStr_replace = listDescStr.replace(/\ +/g, ""); //去掉空格方法
                listDescStr_replace = listDescStr.replace(/[ ]/g, ""); //去掉空格
                listDescStr_replace = listDescStr.replace(/[\r\n]/g, ""); //去掉回车换行
                listDescStr_replace = listDescStr.replace(/-/g, ""); //去掉"-"号
            } catch (e) { }
            if (listDescStr_replace == answer_replace) {
                console.info('答案匹配选项：' + listDescStr_replace);
                delay(random(0.5, 1)); //随机延时0.5-1秒
                try {
                    item.child(0).click(); //点击答案
                    hasClicked = true;
                } catch (e) { } //防止答错后因为child为空导致报错而停止脚本
                delay(0.5); //等待0.5秒，是否出现X
                if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
                    "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC")
                    .exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
                {
                    console.log("题库答案正确……");
                }
                if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
                    "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC")
                    .exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
                {
                    console.error("答案错误!!!");
                    console.error("题目：" + question + "答案：" + answer);
                    var texterror = question + "答案：" + answer;
                    files.append('/sdcard/Wronganswer.txt', "\n" + texterror);
                    /*checkAndUpdate(question, answer, ClickAnswer);*/
                }
                console.log("---------------------------");
            } else {
                console.log('答案未能匹配选项' + iii);
            }
            iii++;
        });
    }
    if (!hasClicked) //如果没有点击成功
    { //因导致不能成功点击问题较多，故该部分不更新题库，大部分问题是题库题目适配为填空题或多选题或错误选项
        console.error("未能成功点击，随机点击");
        let i = random(0, listArray.length - 1);
        delay(random(0.5, 1)); //随机延时0.5-1秒
        listArray[i].child(0).click(); //随意点击一个答案
        console.log("随机点击:" + ClickAnswer);
        delay(0.5); //等待0.5秒，是否出现X
        if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text(
                "再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
        {
            console.log("随机点击正确……");
        }
        if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text(
                "再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
        {
            console.error("随机点击错误!!!");
            /*checkAndUpdate(question, answer, ClickAnswer);*/
        }
        console.log("---------------------------");
    }
}

/**
 * @description: 挑战答题
 * @param: null
 * @return: null
 */
function challengeQuestion() {
    while (status) { console.log("主线程暂停中"); sleep(750); };
    // init();
    if (!className("RadioButton").exists()) {
        while (!text("排行榜").exists()) {
            console.info("等待我要答题界面");
            delay(1);
        }
        var textOrder = text("排行榜").findOnce().parent();
        while (text("排行榜").exists()) {
            console.info("点击挑战答题");
            textOrder.child(10).click();
            delay(2);
        }
    }
    let conNum = 0; //连续答对的次数
    let lNum = 0; //轮数
    var 复活 = true;
    while (true) {
        while (status) { console.log("主线程暂停中"); sleep(750); };
        delay(2);
        if (!className("RadioButton").exists()) {
            if (复活 == false) {
                console.log("出现错误，等5秒开始下一轮...");
                delay(3); //等待3秒才能开始下一轮
                var f = text("再来一局").exists();
                var l = text("选择联系人").exists();
                var fh = text("分享就能复活").exists();
                if (f) {
                    text("再来一局").click();
                    delay(4);
                    conNum = 0;
                    复活 = true;
                } else if (l) {
                    console.info("当处于复活中! 开始正常答题");
                    复活 = false;
                } else if (fh) {
                    console.info("可以复活！");
                    textContains('每局仅可复活一次').waitFor();
                    delay(1);
                    text("分享就能复活").click();
                    delay(1);
                    back();
                    复活 = false;
                }
            } else {
                // toastLog("没有找到题目！请检查是否进入答题界面！");
                console.error("没有找到题目！请检查是否进入答题界面！");
                console.log("停止");
                break;
            }
        }
        challengeQuestionLoop(conNum);
        delay(1);
        if (text('wrong@3x.9ccb997c').exists() || text('2kNFBadJuqbAAAAAElFTkSuQmCC').exists() || text(
            "v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC")
            .exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
        {
            if (conNum >= qCount) {
                lNum++;
                qCount = randomNum(3, 6);
            }
            if (lNum >= lCount) {
                delay(1.2);
                while (status) { console.log("主线程暂停中"); sleep(750); };
                console.log("挑战答题结束！返回我要答题界面！");
                if (复活) {
                    textContains('每局仅可复活一次').waitFor();
                    delay(1);
                    back();
                }
                textContains("再来一局").waitFor();
                delay(1);
                back();
                delay(2);
                break;
            } else {
                if (复活 && conNum < qCount) {
                    复活 = false;
                    delay(0.5);
                    while (status) { console.log("主线程暂停中"); sleep(750); };
                    textContains('分享就能复活').findOne().click();
                    delay(0.5);
                    back();
                    delay(1);
                } else {
                    if (复活) {
                        while (status) { console.log("主线程暂停中"); sleep(750); };
                        textContains('每局仅可复活一次').waitFor();
                        delay(1);
                        back();
                    }
                    console.log("等5秒开始下一轮...");
                    delay(3); //等待3秒才能开始下一轮
                    text("再来一局").click();
                    delay(4);
                    while (status) { console.log("主线程暂停中"); sleep(750); };
                    conNum = 0;
                    复活 = true;
                }
            }
        } else //答对了
        {
            while (status) { console.log("主线程暂停中"); sleep(750); };
            conNum++;
        }
    }
    delay(1);
    if (desc("我的信息").exists()) {
        text("我要答题").findOne().parent().click();
        delay(2);
    }
}
//挑战答题
//////////////////////////////////////////////////////////////////

// var xn = 0;
// var 音字 = false;
/*
获取ocr识别出来的题目,depth_option对应32，question1对应question
*/
function do_contest_answer(depth_option, question1) {
    // console.time('搜题');
    while (status) { console.log("主线程暂停中"); sleep(750); };
    question1 = question1.replace(/先择词语/g, "选择词语");
    question1 = question1.replace(/'/g, ""); // 处理一些标点符号
    question1 = question1.replace(/"/g, "");
    question1 = question1.replace(/“/g, "");
    question1 = question1.replace(/”/g, "");
    old_old_question = question1
    old_question = JSON.parse(JSON.stringify(question1)); //处理question1的数据
    question1 = question1.split('来源:')[0]; //去除来源
    question1 = question1.split('来源：')[0]; //去除来源
    question1 = question1.split('推荐')[0]; //去除推荐
    question = question1.split('A.')[0];
    if (debug) console.info('处理后的题目：' + question);
    // question = question.split('（.*）')[0];
    reg = /下列..正确的是.*/g;
    reb = /选择词语的正确.*/g;
    rea = /选择正确的读音.*/g;
    rec = /下列不属于二十四史的是.*/g;
    rex = /劳动行政部门自收到集体合同文本之日起.*/g;
    var onlx;
    if (reb.test(question) || rea.test(question)) {
        if (debug) console.info('发现选择正确/词语类题目，直接用题库中的选项答题！');
        while (true) {
            if (className('android.widget.RadioButton').depth(32).exists()) {
                break;
            }
            if (text('继续挑战').exists()) return -1;
        }
        console.log('等待选项显示');
        while (status) { console.log("主线程暂停中"); sleep(750); };
        /* 		do {
                    var xuanx = className('ListView').depth(29).findOne().bounds();
                } while (!xuanx == null); */
        className('ListView').depth(29).waitFor();
        try {
            var ocr_s = true;
            var img = captureScreen();
            while (status) { console.log("主线程暂停中"); sleep(750); };
            var b = className('ListView').depth(29).findOne(3000).bounds();
            img = images.clip(img, b.left, b.top, b.right - b.left, b.bottom - b.top);
            if (ocr_model == 1) {
                old_question = easyedge_ocr_api(img);
            } else if (ocr_model == 2) {
                old_question = ocr_api(img);
            } else if (ocr_model == 0) {
                old_question = paddle_ocr_api(img);
            } else {
                console.error("配置异常!");
                exit();
            }
            console.log('选项: ' + old_question);
            var question = old_old_question + old_question;
            if (debug) console.log('合并后：' + question);
        } catch (e) {
            console.error(e);
            console.info('选项获取失败');
        }
        if (reb.test(old_old_question)) {
            xaunxbj = old_question
            xaunxbj = xaunxbj.replace(/A./g, "|");
            xaunxbj = xaunxbj.replace(/B./g, "|");
            var xaunxbjA = xaunxbj.split("|")[1];
            var xaunxbjB = xaunxbj.split("|")[2];
            if (xaunxbjA === xaunxbjB) {
                console.log('AB选项一致，使用原选项');
                onlx = true;
            } else {
                console.log('AB选项不一致，进行乱序识别');
                onlx = false;
            }
        } else {
            onlx = false;
        }
    } else {
        var ocr_s = false;
    }
    var option = 'N';
    var answer = 'N';
    var similars = 0;
    var pos = -1;
    for (var i = 0; i < question_list.length; i++) {
        var s = similarity(question_list[i][0], question_list[i][2], question, false);
        if (s > similars) {
            similars = s;
            pos = i;
        }
        if (s == 999) {
            console.error('异常：s等于999');
            break;
        }
    }
    if (pos != -1) {
        option = question_list[pos][1];
        answer = question_list[pos][2];
    } else {
        console.error('没搜到答案,题目异常：\n“' + old_question + '”，已保存到pos_Wronganswer.txt  长度:' + question_list.length);
        if (debug) console.log('详细日志：\n' + '\n question: \n' + question + '\n ')
        files.append('/sdcard/pos_Wronganswer.txt', "\n" + old_question);
        console.info('此题pos = ' + pos + ',s=' + s + '  等待' + pos_sleep + '秒再答');
        sleep(pos_sleep * 1000);
    }
    if (option[0] >= 'A' && option[0] <= 'D') {
        var ans = answer.split('	')[option[0].charCodeAt(0) - 65];
        console.info('答案:' + ans);
        var last = option;
        if (!ocr_s) {
            while (true) {
                if (className('android.widget.RadioButton').depth(32).exists()) {
                    break;
                }
                if (text('继续挑战').exists()) return -1;
            }
            console.log('等待选项显示');
            // do {
            // 	var xuanx = className('ListView').depth(29).findOne(3000).bounds();
            // } while (!xuanx == null);
            className('ListView').depth(29).waitFor();
            try {
                var img = captureScreen();
                var b = className('ListView').depth(29).findOne(3000).bounds();
                img = images.clip(img, b.left, b.top, b.right - b.left, b.bottom - b.top);
                if (ocr_model == 1) {
                    old_question = easyedge_ocr_api(img);
                } else if (ocr_model == 2) {
                    old_question = ocr_api(img);
                } else if (ocr_model == 0) {
                    old_question = paddle_ocr_api(img);
                } else {
                    console.error("配置异常!");
                    exit();
                }
            } catch (e) {
                console.error(e);
                console.info('选项获取失败');
            }
        }
        if (!onlx) {
            try {
                option = click_by_answer(ans, old_question);
                if (!option) option = last;
            } catch (e) {
                console.error("此题选项异常！！！")
            }
            console.info('点击选项:' + option + '  原选项：' + last);
        } else {
            console.info('点击选项:' + option);
        }
        if (text('继续挑战').exists()) return -1;
        while (!className("ListView").exists()) {
            // className('android.widget.RadioButton').findOnce(answer[0].charCodeAt(0) - 65).click();
            if (text('继续挑战').exists()) return -1;
        }
        if (text('继续挑战').exists()) return -1;
        sleep(竞赛延迟时间);
        onlx = false;
        try {
            while (!className("ListView").findOne(5000).child(option[0].charCodeAt(0) - 65).child(0).click()) {
                if (text('继续挑战').exists()) return -1;
            }
        } catch (e) {
            while (!className('android.widget.RadioButton').depth(depth_option).exists()) {
                if (text('继续挑战').exists()) return -1;
            }
            try {
                className('android.widget.RadioButton').depth(depth_option).findOnce(option[0].charCodeAt(0) - 65)
                    .click();
            } catch (e) {
                console.error('没找到选项,选A跳过');
                className('android.widget.RadioButton').depth(depth_option).findOnce(0).click();
            }
        }
        return 0;
    }
    try {
        className('android.widget.RadioButton').depth(depth_option).findOnce(0).click();
    } catch (e) {
        while (!className("ListView").findOne(5000).child(0).child(0).click()) {
            if (text('继续挑战').exists()) return -1;
        }
    }
    return 0;
}
var o = ['A.', 'B.', 'C.', 'D.', 'AAAA'];
var o1 = ['A', 'B', 'C', 'D', 'AAAA'];

function click_by_answer(ans, question) {
    ans = ans.match(/[\u4e00-\u9fa5a-zA-Z0-9āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜü]/g).join("")
    question = question.replace(/ /g, '');
    question = question.replace(/4\./g, 'A.');
    question = question.replace(/:/g, '：');
    question = question.replace(/c\./g, "C.");
    question = question.replace(/，/g, ".");
    console.log('选项：' + old_question);
    var sum = 0;
    for (var i = 0; i < question.length; i++) {
        if (question[i] >= 'A' && question[i] <= 'D') {
            sum++;
        }
    }
    var op = [];
    if (sum <= 4) {
        question = question.replace(/\./g, "");
        for (var i = 0; i < 4; i++) {
            try {
                var tmp = question.split(o1[i])[1].split(o1[i + 1])[0].split('推荐：')[0].split('出题')[0];
                op.push(tmp.match(/[\u4e00-\u9fa5a-zA-Z0-9āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜü]/g).join(""));
            } catch (e) {
                op.push('&');
            }
        }
    } else {
        for (var i = 0; i < 4; i++) {
            try {
                var tmp = question.split(o[i])[1].split(o[i + 1])[0].split('推荐：')[0].split('出题')[0];
                op.push(tmp.match(/[\u4e00-\u9fa5a-zA-Z0-9āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜü]/g).join(""));
            } catch (e) {
                op.push('&');
            }
        }
    }
    // op[op.length-1] = op[op.length-1].split('推荐')[0].split('出题')[0];
    var s = 0;
    var pos = -1;
    for (var i = 0; i < op.length; i++) {
        if (op[i] == '&') continue;
        if (op[i] == ans) {
            return o1[i];
        }
        var tmp = similarity_answer(op[i], ans);
        if (tmp > s) {
            s = tmp;
            pos = i;
        }
    }
    return o1[pos];
}

function similarity_answer(op, ans) {
    var num = 0;
    for (var i = 0; i < ans.length; i++) {
        if (op.indexOf(ans[i]) != -1) num++;
    }
    for (var i = 0; i < ans.length - 1; i++) {
        if (op.indexOf(ans[i] + ans[i + 1]) != -1) num++;
    }
    for (var i = 0; i < ans.length - 2; i++) {
        if (op.indexOf(ans[i] + ans[i + 1] + ans[i + 2]) != -1) num++;
    }
    return num / (2 * op.length + 2 * ans.length);
}

function similarity(question, answer, q, flag) {
    var num = 0;
    if (flag) {
        if (q.indexOf('十五日') != -1 && question.indexOf('劳动行政部门自收到集体合同文本之日起') != -1 && answer.split('\t')[0].indexOf(
            '十日') != -1) {
            return 999;
        }
        if (q.indexOf('十五日') == -1 && q.indexOf('十日') != -1 && question.indexOf('劳动行政部门自收到集体合同文本之日起') != -1 && answer
            .split('\t')[0].indexOf('五日') != -1) {
            return 999;
        }
        if (question.indexOf('正确') == -1 && question.indexOf('下列不属于二十四史的') == -1) {
            return 0;
        }
        for (var i = 0; i < q.length; i++) {
            if (answer.indexOf(q[i]) != -1) {
                num++;
            }
        }
        return num / (answer.length + q.length);
    } else {
        var tmp = 1;
        if (q.length > 20) tmp = 2;
        if (q.length > 40) tmp = 3;
        if (q.length > 50) tmp = 4;
        for (var i = 0; i < q.length - tmp; i += tmp) {
            if (question.indexOf(q[i] + q[i + 1]) != -1) {
                num++;
            }
        }
        return num / (question.length + q.length);
    }
}

/**
 * 点击对应的去答题或去看看
 * @param {image} img 传入图片,本地。
 */
function ocr_api(img) {
    console.log('第三方本地ocr文字识别中');
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
}

function paddle_ocr_api(img) {
    console.log('内置飞浆文字识别中');
    let cpuThreadNum = 8;
    let useSlim = true;
    if (cpuThreadNum == null || useSlim == null) {
        var OCR_Result = paddle.ocrText(img);
    } else {
        var OCR_Result = paddle.ocrText(img, cpuThreadNum, useSlim);
    }
    OCR_Result = JSON.stringify(OCR_Result);
    var len_OCR = OCR_Result.length - 2
    var str_OCR = [];
    for (var i = 2; i < len_OCR; i++) {
        str_OCR += OCR_Result[i];
    }
    return str_OCR.replace(/","/gi, "");
}

// 百度easyedge
function easyedge_ocr_api(img) {
    console.log('EasyEdge OCR文字识别中');
    var img_scale = images.scale(img, 0.25, 0.25); // 将图片缩放为原来的一半
    var Base64_img = images.toBase64(img_scale, 'jpeg', 50);
    //	var easyedge_ocr_url = hamibot.env.easyedge_ocr_url;
    r = http.postJson(easyedge_ocr_url, {
        action: 'ocr',
        imgPath: Base64_img,
    }
        /* , {
            headers: {
                'Content-Type': 'text/plain;charset=utf8',
                'Connection': 'Keep-Alive',
                'Accept-Encoding': 'gzip, deflate'
            },
            } */
    );
    /* 	r = http.postJson(easyedge_ocr_url, {
            action: 'ocr',
            imgPath: text,
        }); */
    let obj = r.body.json();
    /*
        threads.start(function() {
            img_scale.recycle();
            var r = null, Base64_img = null;
        });*/
    return obj.result;
}

/**
 * @description: 加载题库和加载替换
 * @param: null
 * @return: null
 */
function init() {
    if (files.exists('/sdcard/科技!解放!/question.txt')) {
        tikus = files.read('/sdcard/科技!解放!/question.txt', encoding = "utf-8");
        tikus = tikus.split('\n');
        for (var i = 0; i < tikus.length; i++) {
            var t = tikus[i].split(' ');
            if (t[1] && t[0]) {
                var answer = '';
                for (var j = 2; j < t.length; j++) { // 可能tiku答案有空格，但是被切割了
                    answer += t[j];
                }
                question_list.push([t[1], t[0], answer]);
            }
        }
        answer = null;
        tikus = null;
        init_true = true;
        if (question_list.length < 1000) {
            console.info('四人/双人/挑战题库崩了！！！，等！！！');
            exit();
        }
        init_true = true;
    } else if (!files.exists('/sdcard/科技!解放!/question.txt')) {
        console.error('手机根目录下未找到question.txt （路径： /sdcard/科技!解放!/question.txt）');
        exit();
    } else {
        console.error('未知错误！！！');
        exit();
    }
}

/**
 * @description: 四人赛
 * @param: null
 * @return: null
 */
var xxx = false;

function zsyAnswer() {
    if (first_com_no) {
        console.info('已开启首轮不答');
        sleep(random_time(delay_time));
        if (text("随机匹配").exists()) {
            text("随机匹配").findOne(3000).parent().child(0).click();
            console.log("点击随机匹配");
        } else {
            console.log("点击开始比赛");
            var s = text("开始比赛").findOne(5000);
            if (s) {
                s.click();
            } else {
                console.log('没有找到开始比赛，点击随机匹配');
                text("随机匹配").findOne(3000).parent().child(0).click();
            }
        }
        delay(1);
        while (status) { console.log("主线程暂停中"); sleep(750); };
        if (text('知道了').exists()) {
            console.warn('答题已满');
            text('知道了').findOnce().click();
            delay(2);
            if (text("随机匹配").exists() || text("开始比赛").exists()) {
                console.info('停止脚本');
                exit();
            } else return 0;
        }
        className("ListView").waitFor();
        console.info('等待比赛结束');
        while (!text('继续挑战').exists()) {
            sleep(5000);
        }
        console.info('比赛结束');
        delay(1);
        text('继续挑战').click();
        delay(3);
        var j = text("开始比赛").findOne(5000);
        if (j = null) {
            console.error('不在竞赛页面，停止脚本');
            exit();
        }
        console.info('开始正式比赛');
    }
    var break100 = false;
    var img = captureScreen();
    while (status) { console.log("主线程暂停中"); sleep(750); };
    try {
        var point = findColor(img, '#1B1F25', {
            region: [0, 0, 100, 100],
            threshold: 10,
        });
    } catch (e) {
        console.error(e);
        exit();
    }
    if (ocr_model == 2) {
        ocr_api(img);
    } else if (ocr_model == 1) {
        question = easyedge_ocr_api(img);
    } else if (ocr_model == 0) {
        paddle_ocr_api(img);
    } else {
        console.error("配置异常!");
        exit();
    }
    var count = 2;
    console.info('改变提示框位置');
    console.setPosition(device.width / 10, -device.height / 8);
    // var qn = 0
    for (var i = 0; i < count; i++) {
        sleep(random_time(delay_time));
        if (text("随机匹配").exists()) {
            text("随机匹配").findOne(3000).parent().child(0).click();
            console.log("点击随机匹配");
            count = 1;
        } else {
            console.log("点击开始比赛");
            // my_click_clickable('开始比赛');
            var s = text("开始比赛").findOne(5000);
            if (s) {
                s.click();
            } else {
                console.log('没有找到开始比赛，点击随机匹配');
                text("随机匹配").findOne(3000).parent().child(0).click();
                count = 1;
            }
        }
        while (status) { console.log("主线程暂停中"); sleep(750); };
        delay(1);
        if (text('知道了').exists()) {
            console.warn('答题已满');
            text('知道了').findOnce().click();
            delay(2);
            if (text("随机匹配").exists() || text("开始比赛").exists()) {
                break;
            } else return 0;
        }
        className("ListView").waitFor();
        while (status) { console.log("主线程暂停中"); sleep(750); };
        var range = className("ListView").findOnce().parent().bounds();
        var x = range.left + 20,
            dx = range.right - x - 20;
        var y = range.top,
            dy = device.height - 300 - y;
        console.log('坐标获取完成');
        //if (debug) console.log(cix + "，" + ciy + "，" + cidx + "，" + cidy);
        while (!text('继续挑战').exists()) {
            // if (className('android.widget.Image').depth(23).waitFor()) break;
            do {
                img = captureScreen();
                var point = findColor(img, '#1B1F25', {
                    region: [x, y, dx, dy],
                    threshold: 10,
                });
                // console.log("等待题目显示");
            } while (!point);
            while (status) { console.log("主线程暂停中"); sleep(750); };
            console.time('答题');
            try {
                range = className("ListView").findOnce().parent().bounds();
                img = images.clip(img, x, y, dx, range.bottom - y);
            } catch (e) {
                while (status) { console.log("主线程暂停中"); sleep(750); };
                img = images.clip(img, x, y, dx, dy);
            }
            var question;
            // 文字识别
            if (className("android.view.View").text("100").depth(24).exists()) {
                console.info('有人100了');
                break100 = true;
                break;
            }
            if (ocr_model == 2) {
                question = ocr_api(img);
            } else if (ocr_model == 1) {
                question = easyedge_ocr_api(img);
            } else if (ocr_model == 0) {
                question = paddle_ocr_api(img);
            } else {
                console.error("配置异常!");
                exit();
            }
            question = question.slice(question.indexOf('.') + 1);
            question = question.replace(/,/g, "，");
            console.log('OCR识别出的题目：' + question);
            if (question) {
                while (status) { console.log("主线程暂停中"); sleep(750); };
                var c = do_contest_answer(32, question);
                // 丢进去找答案，并且选择选项
                if (c == -1) {
                    break;
                } else if (c == -2) {
                    className('android.widget.RadioButton').waitFor();
                    continue;
                } // 如果反回-1或者-2 答题结束或者没找到选项
            } else {
                images.save(img, "/sdcard/截图.jpg", "jpg", 50);
                console.error(
                    "没有识别出任何内容，为了查错已经将截图保存在根目录./截图.jpg，如果截图正常并使用的是本地ocr，那么当前你的手机可能并不适配该ocr，百度/华为ocr则检查扣费次数情况");
                console.log('截图坐标为(' + x + ',' + y + '),(' + dx + ',' + dy + ')');
                break;
            }
            console.timeEnd('答题');
            // 根据选项颜色判断是否答错
            img.recycle(); // 回收
            while (status) { console.log("主线程暂停中"); sleep(750); };
            do {
                var point = findColor(captureScreen(), '#555AB6', {
                    region: [x, y, dx, dy],
                    threshold: 10,
                });
            } while (!point);
            if (break100) {
                var true100 = className("android.view.View").text("100").depth(24).findOne(500);
                if (true100 == null) {
                    console.info('无法确定是否有人真的100！不动作');
                    var break100 = false;
                } else {
                    console.info('有人100了，不再等待下一题！');
                    var break100 = false;
                    sleep(5000);
                    while (true) {
                        if (text("继续挑战").exists()) {
                            break;
                        } else {
                            sleep(500);
                        }
                    }
                    break;
                }
            }
            console.log('等待下一题\n----------');
        }
        // 四人
        if (i == 0 && count == 2) {
            sleep(random_time(delay_time));
            console.log('第二轮答题开始');
            while (!click('继续挑战'));
            sleep(random_time(delay_time));
        }
    }
    console.info('答题结束'); // 竞赛结束
    while (status) { console.log("主线程暂停中"); sleep(750); };
    delay(2);
    back();
    delay(3);
    back();
    delay(3);
    if (count == 1) {
        if (className("android.view.View").text("确定离开擂台吗？").exists()) {
            delay(2);
            className("android.widget.Button").text("退出").findOne().click();
        } else {
            console.warn('没有找到退出，按坐标点击(可能失败)\n如果没返回，手动退出双人赛即可继续运行');
            delay(2);
            click(device.width * 0.2, device.height * 0.53);
        }
        sleep(random_time(delay_time));
    }
    // 防止没成功退出
    if (text("继续挑战").exists()) {
        console.error("退出结算页面失败 重新尝试退出");
        while (status) { console.log("主线程暂停中"); sleep(750); };
        back();
        while (status) { console.log("主线程暂停中"); sleep(750); };
    }
    if (!textContains("排行榜").exists) {
        delay(1);
        if (textContains("开始比赛").exists() || textContains("随机匹配").exists()) {
            console.error("仍处于准备比赛页面！");
            back();
            delay(3);
            back();
            delay(3);
            if (count == 1) {
                if (className("android.view.View").text("确定离开擂台吗？").exists()) {
                    delay(2);
                    className("android.widget.Button").text("退出").findOne().click();
                } else {
                    console.warn('没有找到退出，按坐标点击(可能失败)\n如果没返回，手动退出双人赛即可继续运行');
                    delay(2);
                    click(device.width * 0.2, device.height * 0.53);
                }
                sleep(random_time(delay_time));
            }
        } else {
            console.error("未知错误！ ");
            while (true) {
                back();
                sleep(1500);
                if (textContains("确定离开擂台吗？").exists()) {
                    text("确定").click();
                }
                if (textContains("排行榜").exists()) {
                    console.info("已返回我要答题页面");
                    break;
                }
            }
        }
    }
}

var ta = 2000 * 1;
if (!ta || ta <= 0) ta = 1500;
var thread = null;

function rt() {
    var num = 0;
    while (true) {
        num++;
        console.log('设置脚本运行最长时间为：' + ta + 's');
        device.keepScreenOn(ta * 1000 + 60000);
        thread = threads.start(function () {
            rand_mode();
        })
        thread.join(ta * 1000);
        thread.interrupt();
        console.error('脚本超时或者出错！！！，重启脚本');
        if (!(launchApp("学习强国") || launch('cn.xuexi.android'))) //启动学习强国app
        { }
        console.info('等待10s后继续开始');
        toast('等待10s后继续开始');
        delay(10);
        back_table();
        toast(' ');
        delay(1);
        if (num > 3) break;
    }
    console.error('已经重新运行了3轮，停止脚本');
    question_list = null;
    console.error('无障碍服务可能出了问题');
    exit();
}
rt();

function push_score() {
    console.warn('正在获取今日积分');
    var score = getScores(3);
    score += '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n';
    try {
        url = 'https://pushplus.hxtrip.com/send?token=' + 配置_其他.push_Token.replace(/ /g, '') +
            '&title=Study&content=' + score + '&template=html';
        http.get(url);
    } catch (e) { }
    try {
        url = 'http://www.pushplus.plus/send?token=' + 配置_其他.push_Token.replace(/ /g, '') + '&title=Study&content=' +
            score + '&template=html';
        http.get(url);
    } catch (e) { }
}

function re_store() {
    try {
        if (配置_选项.xianzhi) {
            console.warn('四人双人答题无限制开启');
            zsyCount = 1;
            doubleCount = 1;
        }
    } catch (e) { };
}

function back_table() {
    delay(1);
    var num = 0;
    while (!desc("工作").exists()) { //等待加载出主页
        console.info("当前没有在主页，正在返回主页");
        back();
        delay(1);
        num++;
        if (className('Button').textContains('退出').exists()) {
            var c = className('Button').textContains('退出').findOne(3000);
            if (c) c.click();
            delay(1);
        }
        if (num > 10) {
            console.error('返回超过10次，可能当前不在xxqg，正在启动app...');
            if (!(launchApp("学习强国") || launch('cn.xuexi.android'))) //启动学习强国app
            { }
            console.info('等待10s继续进行');
            delay(10);
            num = 0;
        }
    }
    // console.info('当前在主页，回到桌面！');
    // home();  //回到桌面
}

function rand_mode() {
    start_app(); //启动app
    // 四人();    
    var start = new Date().getTime(); //程序开始时间
    getScores(0); //获取积分
    re_store();

    var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var t;
    for (var i = 0; i < arr.length; i++) {
        var rand = parseInt(Math.random() * arr.length);
        t = arr[rand];
        arr[rand] = arr[i];
        arr[i] = t;
    }
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == 0) {
            专项();
        } else if (arr[i] == 1) {
            每周();
        } else if (arr[i] == 2) {
            视频学习();
        } else if (arr[i] == 3) {
            订();
        } else if (arr[i] == 4) {
            //} else if (true) {
            挑战();
        } else if (arr[i] == 5) {
            文章和广播();
        } else if (arr[i] == 6) {
            双人();
        } else if (arr[i] == 7) {
            每日();
        } else if (arr[i] == 8) {
            //} else if (true) {
            本地();
        } else if (arr[i] == 9) {
            四人();
        }
    }
    question_list = null;
    article_list = null;
    back_table();
    if (配置_其他.push_Token != null && 配置_其他.push_Token.length > 6) {
        delay(1);
        push_score();
    }
    end = new Date().getTime();
    console.log("运行结束,共耗时" + (parseInt(end - start)) / 1000 + "秒");
    console.log("共发生 " + thread1_i + "次人机验证，成功滑动 " + thread1_ii + "次");
    if (whethe) {
        delay(2);
        device.setMusicVolume(volume);
        console.info('已解除静音')
    }
    console.log("3s后自动关闭悬浮窗，查看日志请到科技!解放!查看");
    thread1.interrupt();
    desc("工作").click();
    delay(3);
    console.hide();
    device.cancelKeepingAwake();
    exit();
}

function 专项() {
    if (zhuanxiang_txt == true && zhuanxiang != 0) {
        console.info('开始专项答题');
        delay(1);
        if (!text("排行榜").exists()) {
            console.info("进入我要答题");
            questionShow(); // 进入我要答题
            delay(1);
        }
        zhuanxiangAnswer();
        delay(0.5);
    }
}

function 每周() {
    if (meizhou_txt == true && meizhou != 0) {
        console.error("每周答题已不再更新新题！");
        console.info('开始每周答题');
        delay(1);
        if (!text("排行榜").exists()) {
            console.info("进入我要答题");
            questionShow(); // 进入我要答题
            delay(1);
        }
        meizhouAnswer();
        delay(0.5);
    }
}

function 双人() {
    if (doubleCount != 0 && shuangren == true) {
        console.info('开始双人答题');
        delay(2);
        if (!text("排行榜").exists()) {
            console.info("进入我要答题");
            questionShow(); // 进入我要答题
            delay(1);
        }
        while (!text("排行榜").exists()) {
            console.info("等待我要答题界面");
            delay(1);
        }
        var textOrder = text("排行榜").findOnce().parent();
        while (text("排行榜").exists()) {
            console.info("点击双人答题，悬浮窗位置改变");
            textOrder.child(9).click();
            delay(1);
        }
        zsyAnswer();
        delay(1);
        console.info("双人答题结束，悬浮窗位置改变");
        console.setPosition(0, device.height / 2);
    }
}

function 四人() {
    if (zsyCount != 0 && siren == true) {
        // delay(2);
        console.info('开始四人答题');
        delay(2);
        if (!text("排行榜").exists()) {
            console.info("进入我要答题");
            questionShow(); // 进入我要答题
            delay(1);
        }
        while (!text("排行榜").exists()) {
            console.info("等待我要答题界面");
            delay(1);
        }
        var textOrder = text("排行榜").findOnce().parent();
        while (text("排行榜").exists()) {
            console.info("点击四人赛答题，悬浮窗位置改变");
            textOrder.child(8).click();
            delay(1);
        }
        zsyAnswer();
        delay(0.5);
        console.info("四人赛答题结束，悬浮窗位置改变");
        console.setPosition(0, device.height / 2);
        //delay(1);
        // back();
    }
}

function 挑战() {
    //tzCount = 1;
    if ((tzCount != 0 || 点点通['挑战答题']) && tiaozhan == true) {
        news = false;
        console.info('开始挑战答题');
        if (!text("排行榜").exists()) {
            console.info("进入我要答题");
            questionShow(); // 进入我要答题
            delay(1);
        }
        delay(1);
        challengeQuestion(); //挑战答题
        delay(0.5);
    }
}

function 每日() {
    // dayCount = 1;
    if (dayCount != 0 && meiri == true) {
        console.info('开始每日答题');
        if (!text("排行榜").exists()) {
            console.info("进入我要答题");
            questionShow(); // 进入我要答题
            delay(1);
        }
        delay(1);
        dailyAnswer(); // 每天答题
        delay(0.5);
    }
}

function 视频学习() {
    var x = 1;
    if (text("排行榜").exists()) {
        delay(0.5);
        back();
        delay(0.5);
        back();
        delay(0.5);
    }
    while (!desc("工作").exists()) { //等待加载出主页
        console.info("等待加载主页");
        if (text("排行榜").exists()) {
            delay(0.5);
            back();
            delay(0.5);
            back();
            delay(0.5);
        }
        delay(2);
    }
    while ((vCount != 0 || 点点通['有效视听']) && video != 'a') {
        if (点点通['有效视听'])
            vCount = Math.max(点点通['有效视听'] * 6 - (6 - vCount), 点点通['有效视听'] * 6);
        console.error('当前第' + x + '次看视频');
        if (video == 'b')
            videoStudy_news(x); //看视频
        else if (video == 'a')
            video_news(x); //电视台
        else new_bailing_video(x); // 新百灵
        console.info("等待3秒，然后确认视频是否已满分。");
        delay(3);
        getScores(2);

        x++;
        if (x > 2) { //尝试三次
            console.info("尝试2次，跳过。");
            break;
        }
    }
}

function 本地() {
    if (myScores['本地频道'] != 1 && loca == true) {
    //if (true) {
        console.info('开始本地频道');
        if (text("排行榜").exists()) {
            delay(0.5);
            back();
            delay(0.5);
            back();
            delay(0.5);
        }
        while (!desc("工作").exists()) { //等待加载出主页
            console.info("等待加载主页");
            if (text("排行榜").exists()) {
                delay(0.5);
                back();
                delay(0.5);
                back();
                delay(0.5);
            }
            delay(2);
        }
        localChannel(); //本地频道
    }
}

function 订() {
    if (订阅 != 'a' && asub != 0) {
        if (text("排行榜").exists()) {
            delay(0.5);
            back();
            delay(0.5);
            back();
            delay(0.5);
        }
        while (!desc("工作").exists()) { //等待加载出主页
            console.info("等待加载主页");
            if (text("排行榜").exists()) {
                delay(0.5);
                back();
                delay(0.5);
                back();
                delay(0.5);
            }
            delay(2);
        }
        sub(); //订阅
    }
}


function 文章和广播() {
    if (text("排行榜").exists()) {
        delay(0.5);
        back();
        delay(0.5);
        back();
        delay(0.5);
    }
    while (!desc("工作").exists()) { //等待加载出主页
        console.info("等待加载主页");
        if (text("排行榜").exists()) {
            delay(0.5);
            back();
            delay(0.5);
            back();
            delay(0.5);
        }
        delay(2);
    }
    if (rTime != 0 && articles == true) {
        listenToRadio(); //听电台广播
        h = device.height; //屏幕高
        w = device.width; //屏幕宽
        x = (w / 3) * 2;
        h1 = (h / 6) * 5;
        h2 = (h / 6);
        delay(1);
        swipe(x, h1, x, h2, 100);
    }
    var r_start = new Date().getTime(); //广播开始时间
    var x = 0;
    while ((aCount != 0 || 点点通['有效浏览']) && articles == true) {
        aTime = 61;
        articleStudy(x); //学习文章，包含点赞、分享和评论
        console.info("等待3秒，然后确认文章是否已满分。");
        delay(3);
        getScores(1);
        x++;
        if (x > 2) { //尝试三次
            console.info("尝试3次未满分，暂时跳过。");
            break;
        }
    }
    if (articles == true) {
        var end = new Date().getTime(); //广播结束时间
        var radio_time = (parseInt((end - r_start) / 1000)); //广播已经收听的时间
        radio_timing(parseInt((end - r_start) / 1000), rTime - radio_time); //广播剩余需收听时间
        if (rTime != 0) {
            stopRadio();
        }
    }

}
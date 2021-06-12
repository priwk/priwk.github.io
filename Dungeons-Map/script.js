const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 按钮开关 常用的功能
rulesBtn.addEventListener('click', () => rules.classList.add('show'));
closeBtn.addEventListener('click', () => rules.classList.remove('show'));
// 随机数函数
function randInt(min, max) {
    max = max || 0;
    min = min || 0;
    var step = Math.abs(max - min);
    var st = (arguments.length < 2) ? 0 : min; //参数只有一个的时候，st = 0;
    var result;
    result = st + (Math.ceil(Math.random() * step)) - 1;
    return result;
}
// prim算法
// 照着书上用Javascript写了好几遍都有错，这一段就去网上抄了
function primMaze(r, c) {
    //初始化数组
    function init(r, c) {
        var a = new Array(2 * r + 1);
        //全部置1
        for (let i = 0, len = a.length; i < len; i++) {
            var cols = 2 * c + 1;
            a[i] = new Array(cols);
            for (let j = 0, len1 = a[i].length; j < len1; j++) {
                a[i][j] = 1;
            }
        }
        //中间格子为0
        for (let i = 0; i < r; i++)
            for (let j = 0; j < c; j++) {
                a[2 * i + 1][2 * j + 1] = 0;
            }
        return a;
    }
    //处理数组，产生最终的数组
    function process(arr) {
        //acc存放已访问队列，noacc存放没有访问队列
        var acc = [],
            noacc = [];
        var r = arr.length >> 1,
            c = arr[0].length >> 1;
        var count = r * c;
        for (var i = 0; i < count; i++) {
            noacc[i] = 0;
        }
        //定义空单元上下左右偏移
        var offs = [-c, c, -1, 1],
            offR = [-1, 1, 0, 0],
            offC = [0, 0, -1, 1];
        //随机从noacc取出一个位置
        var pos = randInt(count);
        noacc[pos] = 1;
        acc.push(pos);
        while (acc.length < count) {
            var ls = -1,
                offPos = -1;
            offPos = -1;
            //找出pos位置在二维数组中的坐标
            var pr = pos / c | 0,
                pc = pos % c,
                co = 0,
                o = 0;
            //随机取上下左右四个单元
            while (++co < 5) {
                o = randInt(0, 5);
                ls = offs[o] + pos;
                var tpr = pr + offR[o];
                var tpc = pc + offC[o];
                if (tpr >= 0 && tpc >= 0 && tpr <= r - 1 && tpc <= c - 1 && noacc[ls] == 0) {
                    offPos = o;
                    break;
                }
            }
            if (offPos < 0) {
                pos = acc[randInt(acc.length)];
            } else {
                pr = 2 * pr + 1;
                pc = 2 * pc + 1;
                //相邻空单元中间的位置置0
                arr[pr + offR[offPos]][pc + offC[offPos]] = 0;
                pos = ls;
                noacc[pos] = 1;
                acc.push(pos);
            }
        }
    }
    var a = init(r, c);
    process(a);
    return a;
    //返回一个二维数组，行的数据为2r+1个,列的数据为2c+1个
}
// 给tileMap.maps赋值
tileMap = {
    maps: primMaze(15, 7),
}

//这里随机数是为了使地板随机化
//如果把随机函数写入draw函数的话,地板素材就会因为有个requestAnimationFrame()，会不断鬼畜
//想了半天就写个随机种子组seed[]，这样每次刷新就会有新的随机数组

var seed = new Array;

function makeSeed() {
    for (var i = 0; i < 400; i++) {
        seed[i] = randInt(1, 20);
    }
}

makeSeed();

// draw函数 

function draw() {
    lengthX = tileMap.maps.length;
    lengthY = tileMap.maps[0].length;
    for (var i = 0; i < lengthX; i++) {
        for (var j = 0; j < lengthY; j++) {
            var img = new Image();
            if (tileMap.maps[i][j] == 1) {
                if (i != 0 && i != lengthX - 1 && j != 0 && j != lengthY - 1) {
                    var pit = 0;
                    // 用这种方法判断墙体类型,选用不同素材
                    // 可能有更好的方法,但我不知道
                    // 而且不知道哪里算错了,最后暴力调回来了,所有下面的顺序是混乱的
                    if (tileMap.maps[i - 1][j] == 0) pit += 10;
                    if (tileMap.maps[i + 1][j] == 0) pit += 100;
                    if (tileMap.maps[i][j - 1] == 0) pit += 1000;
                    if (tileMap.maps[i][j + 1] == 0) pit += 10000;
                    /*其实刚开始是在tileMap对象下直接添加图片的

                    files: ["0.png", "1.png", ……],

                    然后img.src=tileMap.files[x]取图片,但是不知道为什么总有谜之bug,
                    每次只显示1.png,其他文件根本没读入,最后就像下面直接写地址了
                     */
                    switch (pit) {
                        // 2空相邻
                        case 11000:
                            img.src = "assets/1.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                        case 110:
                            img.src = "assets/0.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                        case 1100:
                            img.src = "assets/4.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                        case 10100:
                            img.src = "assets/3.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                        case 10010:
                            img.src = "assets/2.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                        case 1010:
                            img.src = "assets/5.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                            // 1空相邻
                        case 10:
                            img.src = "assets/8.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                        case 10000:
                            img.src = "assets/9.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                        case 1000:
                            img.src = "assets/6.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                        case 100:
                            img.src = "assets/7.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                            // 3空相邻
                        case 11100:
                            img.src = "assets/12.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                        case 10110:
                            img.src = "assets/13.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                        case 1110:
                            img.src = "assets/10.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                        case 11010:
                            img.src = "assets/11.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                            // 0空相邻
                        case 0:
                            img.src = "assets/14.png";
                            ctx.drawImage(img, i * 32, j * 32);
                            break;
                    }
                } else {
                    // 这里可以设置边缘素材
                    // img.src = "border.png";
                    // ctx.drawImage(img, i * 32, j * 32);
                }
            } else {
                // 地板的随机化
                img.src = "assets/road" + seed[i * j] + ".png";
                ctx.drawImage(img, i * 32, j * 32);
            }
        }
    }
}


function update() {
    draw();
    requestAnimationFrame(update);
}

update();


// 刷新函数

function F5() {
    location.reload();
    //console.log(seed);
}

document.querySelector('.rebuild').addEventListener('click', F5);
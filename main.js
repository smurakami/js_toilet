enchant();

var GAME_WIDTH  = 320;
var GAME_HEIGHT = 320;

var unko_imgs = [
    "img/unko_blue.png",
    "img/unko_green.png",
    "img/unko_orange.png",
    "img/unko_pink.png",
    "img/unko_purple.png",
    "img/unko_red.png",
    "img/unko_standerd.png",
];
var github_img = "img/github.png";
var unko_imgs_num = unko_imgs.length;

var game;
var toilet;
var flusher;
var label;
var label_flush;
var score;
var label_enable = true;
var label_flush_enable = false;
var gauge;

var Unko = enchant.Class.create(PhyCircleSprite, {
    initialize: function(){
        PhyCircleSprite.call(this, 8, enchant.box2d.DYNAMIC_SPRITE, 1.0, 1.0, 0.5, true);

        // var velocity = (100 + Math.random() * 400) * (1 + toilet.counter * 0.02);
        var velocity = (100 + Math.random() * 400) * 2;
        var direction = (0.2 + Math.random() * 0.6) * Math.PI;

        this.position = {x: GAME_WIDTH / 2, y: GAME_HEIGHT - 48};
        this.velocity = {x: velocity * Math.cos(direction), y: velocity * -Math.sin(direction)};
        var img_index = Math.floor(Math.random() * unko_imgs_num);
        if(Math.random() > 0.05) this.image = game.assets[unko_imgs[img_index]];
        else this.image = game.assets[github_img];
        this.addEventListener('enterframe', this.update);
        game.rootScene.insertBefore(this, toilet);
    },
    update: function(){
        if(flusher.flushing){
            this.vx += this.position.x > GAME_WIDTH / 2 ? -20 : 20;
            if(this.position.x > toilet.hitbody.x - 9 && this.position.x < toilet.hitbody.x + toilet.hitbody.width + 9 &&
               this.position.y > toilet.hitbody.y - toilet.hitbody.height / 2 && this.position.y < toilet.hitbody.y + toilet.hitbody.height + 9){
                score.gain();
                this.destroy();
            }
        }
    },
});

var Toilet = enchant.Class.create(enchant.Sprite, {
    initialize: function(){
        enchant.Sprite.call(this, 54, 58);
        this.counter = 0;
        this.image = game.assets['img/toilet.png'];
        this.x = GAME_WIDTH / 2 - this.width / 2;
        this.y = GAME_HEIGHT - 8 - this.height;
        this.hitbody = new PhyBoxSprite(34, 24, enchant.box2d.STATIC_SPRITE, 1.0, 0.5, 0.0, true)
        this.hitbody.x = this.x + 1;
        this.hitbody.y = this.y + 34;

        game.rootScene.addChild(this);
        game.rootScene.addChild(this.hitbody);
    },
    yield: function(){
        var num = 10;
        for (var i = 0; i < num; i++){
            new Unko();
        }
        this.counter += num;
    }
});

var Flusher = enchant.Class.create(enchant.Sprite, {
    initialize: function(){
        enchant.Sprite.call(this, 150, 53);
        this.image = game.assets['img/flusher.png']
        this.x = 160;
        this.y = GAME_HEIGHT - 78;

        this.hitbody = new PhyBoxSprite(24, 26, enchant.box2d.STATIC_SPRITE, 1.0, 0.5, 0.0, true)
        this.hitbody.x = this.x + 35 + 150 - 63;
        this.hitbody.y = this.y + 13;

        this.flushing = false;

        //流す処理
        var self = this;
        this.hitbody.contact(function(obj){
            if(self.flushing) obj.destroy();
        });

        this.hitbody.addEventListener('touchstart', function(){
            self.flushing = true;
            toilet.hitbody.y += toilet.hitbody.height;
            if(label_flush_enable){
                label_flush.destroy();
                label_flush_enable = false;
            }
        });
        this.hitbody.addEventListener('touchend', function(){
            toilet.hitbody.y -= toilet.hitbody.height;
            self.flushing = false;
        })

        game.rootScene.addChild(this);
        game.rootScene.addChild(this.hitbody);
    },

});



var Room = enchant.Class.create(enchant.Sprite, {
    initialize: function(){
        // 床の生成
        this.floor = new PhyBoxSprite(GAME_WIDTH, 16, enchant.box2d.STATIC_SPRITE, 1.0, 0.5, 0.0, true);
        this.floor.backgroundColor = "gray";
        this.floor.position = {x:GAME_WIDTH/2, y:GAME_HEIGHT};
        game.rootScene.addChild(this.floor);
        // 天井の生成
        this.ceil = new PhyBoxSprite(GAME_WIDTH, 16, enchant.box2d.STATIC_SPRITE, 1.0, 0.5, 0.0, true);
        this.ceil.backgroundColor = "gray";
        this.ceil.position = {x:GAME_WIDTH/2, y:-GAME_HEIGHT};
        game.rootScene.addChild(this.ceil);
        // 壁の生成 左
        this.wallLeft = new PhyBoxSprite(16, GAME_HEIGHT*2, enchant.box2d.STATIC_SPRITE, 1.0, 0.0, 1.0, true);
        this.wallLeft.backgroundColor = "gray";
        this.wallLeft.position = {x: 0, y: 0};
        game.rootScene.addChild(this.wallLeft);
        // 壁の生成 右
        this.wallRight = new PhyBoxSprite(16, GAME_HEIGHT*2, enchant.box2d.STATIC_SPRITE, 1.0, 0.0, 1.0, true);
        this.wallRight.backgroundColor = "gray";
        this.wallRight.position = {x: GAME_WIDTH, y: 0};
        game.rootScene.addChild(this.wallRight);
    },
});

var Label = enchant.Class.create(enchant.Sprite, {
    initialize: function(){
        enchant.Sprite.call(this, 68, 30);
        this.image = game.assets['img/label.png'];
        this.age = 0;
        this.term = Math.floor(game.fps * 0.6);
        this.x = toilet.x + toilet.width/2 - this.width/2 - 6;
        this.y = toilet.y - this.height/2 - 15;
        this.addEventListener('enterframe', this.update);
        game.rootScene.addChild(this);
    },
    update: function(){
        if(this.age % this.term > this.term / 4){
            this.frame = 0;
        }else {
            this.frame = 1;
        }
        this.age++;
    },
    destroy: function(){
        this.removeEventListener('enterframe', this.update);
        game.rootScene.removeChild(this);
    }
});

var LabelFlush = enchant.Class.create(enchant.Sprite, {
    initialize: function(){
        enchant.Sprite.call(this, 60, 60);
        this.image = game.assets['img/label_flush.png'];
        this.age = 0;
        this.term = Math.floor(game.fps * 0.6);
        this.x = GAME_WIDTH - 60;
        this.y = toilet.y - this.height/2 - 35;
        this.addEventListener('enterframe', this.update);
        game.rootScene.addChild(this);
    },
    update: function(){
        if(this.age % this.term > this.term / 4){
            this.frame = 0;
        }else {
            this.frame = 1;
        }
        this.age++;
    },
    destroy: function(){
        this.removeEventListener('enterframe', this.update);
        game.rootScene.removeChild(this);
    }
});

var Score = enchant.Class.create(enchant.Label, {
    initialize: function(){
        enchant.Label.call(this, "score : 0");
        this.num = 0;
        this.x = GAME_WIDTH - 90;
        this.y = 10;
        game.rootScene.addChild(this);
    },
    gain: function(){
        this.num++;
        this.text = "score : " + this.num;
    }
});

var Gauge = enchant.Class.create(enchant.Sprite, {
    initialize: function(){
        enchant.Sprite.call(this, 30, 30);
        this.x = 0;
        this.y = 0;
        this.backgroundColor = "red";

        game.rootScene.addChild(this);
    },
    update: function(){

    }
});

window.onload = function() {
    game = enchant.Core(GAME_WIDTH, GAME_HEIGHT);
    game.fps = 30;
    //画像のロード
    game.preload('img/toilet.png', 'img/label.png', 'img/label_flush.png', 'img/flusher.png');
    for (var i = 0; i < unko_imgs_num; i++){
        game.preload(unko_imgs[i]);
    }
    game.preload(github_img);
    game.rootScene.backgroundColor = 'rgb(0, 255, 127)';

    game.onload = function() {
        var world = new PhysicsWorld(0.0, 25);
        // var apple = new PhyCircleSprite(8, enchant.box2d.DYNAMIC_SPRITE, 1.0, 0.5, 1.0, true);
        // apple.backgroundColor = "red";
        // game.rootScene.addChild(apple);

        flusher = new Flusher();
        toilet = new Toilet();
        new Room();
        label = new Label();
        score = new Score();
        // gauge = new Gauge();

        game.rootScene.addEventListener('touchstart', function(e){
            if(e.x > toilet.x && e.x < toilet.x + toilet.width && e.y > toilet.y && e.y < toilet.y + toilet.height){
                toilet.yield();
                if(label_enable){
                    label.destroy();
                    label_enable = false;
                    label_flush = new LabelFlush();
                    label_flush_enable = true;
                }
            }
        });

        game.rootScene.onenterframe = function(e) {
            //物理世界の時間を進める
            world.step(game.fps);
        };
    };
    game.start();
};
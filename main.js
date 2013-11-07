enchant();

var GAME_WIDTH  = 320;
var GAME_HEIGHT = 320;

var core;
var toilet;

var Unko = enchant.Class.create(PhyCircleSprite, {
    initialize: function(){
        PhyCircleSprite.call(this, 8, enchant.box2d.DYNAMIC_SPRITE, 1.0, 1.0, 0.5, true);

        var velocity = (100 + Math.random() * 400) * (1 + toilet.counter * 0.02);
        var direction = (0.2 + Math.random() * 0.6) * Math.PI;

        this.position = {x: GAME_WIDTH / 2, y: GAME_HEIGHT - 48};
        this.velocity = {x: velocity * Math.cos(direction), y: velocity * -Math.sin(direction)};
        this.image = core.assets['img/unko.png'];
        core.rootScene.addChild(this);
    },
});

var Toilet = enchant.Class.create(enchant.Sprite, {
    initialize: function(){
        enchant.Sprite.call(this, 54, 58);
        this.counter = 0;
        this.image = core.assets['img/toilet.png'];
        this.x = GAME_WIDTH / 2 - this.width / 2;
        this.y = GAME_HEIGHT - 8 - this.height;
        this.hitbody = new PhyBoxSprite(34, 24, enchant.box2d.STATIC_SPRITE, 1.0, 0.5, 0.0, true)
        this.hitbody.x = this.x + 1;
        this.hitbody.y = this.y + 34;

        core.rootScene.addChild(this);
        core.rootScene.addChild(this.hitbody);
    },
    yield: function(){
        var num = 10;
        for (var i = 0; i < num; i++){
            new Unko();
        }
        this.counter += num;
    }
});

var Room = enchant.Class.create(enchant.Sprite, {
    initialize: function(){
        // 床の生成
        this.floor = new PhyBoxSprite(GAME_WIDTH, 16, enchant.box2d.STATIC_SPRITE, 1.0, 0.5, 0.0, true);
        this.floor.backgroundColor = "gray";
        this.floor.position = {x:GAME_WIDTH/2, y:GAME_HEIGHT};
        core.rootScene.addChild(this.floor);
        // 天井の生成
        this.ceil = new PhyBoxSprite(GAME_WIDTH, 16, enchant.box2d.STATIC_SPRITE, 1.0, 0.5, 0.0, true);
        this.ceil.backgroundColor = "gray";
        this.ceil.position = {x:GAME_WIDTH/2, y:-GAME_HEIGHT};
        core.rootScene.addChild(this.ceil);
        // 壁の生成 左
        this.wallLeft = new PhyBoxSprite(16, GAME_HEIGHT*2, enchant.box2d.STATIC_SPRITE, 1.0, 0.0, 1.0, true);
        this.wallLeft.backgroundColor = "gray";
        this.wallLeft.position = {x: 0, y: 0};
        core.rootScene.addChild(this.wallLeft);
        // 壁の生成 右
        this.wallRight = new PhyBoxSprite(16, GAME_HEIGHT*2, enchant.box2d.STATIC_SPRITE, 1.0, 0.0, 1.0, true);
        this.wallRight.backgroundColor = "gray";
        this.wallRight.position = {x: GAME_WIDTH, y: 0};
        core.rootScene.addChild(this.wallRight);
    },
});

var Label = enchant.Class.create(enchant.Sprite, {
    initialize: function(){
        enchant.Sprite.call(this, 68, 30);
        this.image = core.assets['img/label.png'];
        this.age = 0;
        this.term = Math.floor(core.fps * 0.6);
        this.x = toilet.x + toilet.width/2 - this.width/2 - 6;
        this.y = toilet.y - this.height/2 - 15;
        this.addEventListener('enterframe', this.update);
        core.rootScene.addChild(this);
    },
    update: function(){
        if(this.age % this.term > this.term / 4){
            this.frame = 0;
        }else {
            this.frame = 1;
        }
        this.age++;
    }
});


window.onload = function() {
    core = enchant.Core(GAME_WIDTH, GAME_HEIGHT);
    core.fps = 30;
    core.preload('img/unko.png', 'img/toilet.png', 'img/label.png');
    core.rootScene.backgroundColor = 'rgb(0, 255, 127)';


    core.onload = function() {
        var world = new PhysicsWorld(0.0, 25);
        // var apple = new PhyCircleSprite(8, enchant.box2d.DYNAMIC_SPRITE, 1.0, 0.5, 1.0, true);
        // apple.backgroundColor = "red";
        // core.rootScene.addChild(apple);

        toilet = new Toilet();
        new Room();
        new Label();

        core.rootScene.addEventListener('touchstart', function(e){
            if(e.x > toilet.x && e.x < toilet.x + toilet.width && e.y > toilet.y && e.y < toilet.y + toilet.height){
                toilet.yield();
            }
        });

        core.rootScene.onenterframe = function(e) {
            //物理世界の時間を進める
            world.step(core.fps);
        };
    };
    core.start();
};
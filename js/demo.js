window.onload = function(e)
{
    let type = "WebGL"
    if(!PIXI.utils.isWebGLSupported())
    {
      type = "canvas"
    }
    function onDragStart(event) 
    {
        if(state === 'arrangement')
        {
            this.dragging = true;
            this.data.drag = {};
            this.data.drag.eventData = event.data;
            this.data.drag.start = {};
            this.data.drag.start.x = this.x;
            this.data.drag.start.y = this.y;            
        }
        if(state === 'connection')
        {
            let line = new Graphics();
            line.lineStyle(2, 0xffffff, .5);
            line.moveTo(0, 0);
            line.lineTo(this.anchor.x, this.anchor.y);
            // line.x = 120;
            // line.y = 120;
            app.stage.addChild(line);
        }
    }
    function onDragEnd() 
    {
        if(this.dragging !== true)
        {
            return;
        }
        let self = this;
        let rec = {};
        let offset = {};
        offset.x = (this.x - this.data.drag.start.x);
        offset.y = (this.y - this.data.drag.start.y);
        // console.log(offset);
        if(Math.abs(offset.x) > 0 || Math.abs(offset.y) > 0)
        {
            rec.operation = 'move';        
            rec.details = 
                {
                    id: this.id,
                    x: this.data.drag.start.x,
                    y: this.data.drag.start.y
                }
            offset.x = rec.details.x.toFixed(2).toString(); // (offset.x >= 0) ? '+' + offset.x.toFixed(2).toString() : offset.x.toFixed(2).toString();
            offset.y = rec.details.y.toFixed(2).toString(); // (offset.y >= 0) ? '+' + offset.y.toFixed(2).toString() : offset.y.toFixed(2).toString();
            rec.text = 'Перемещение объекта #'+this.id+'\' ('+offset.x+'; '+offset.y+')';            
            rec.node = $('<div>').addClass('record').text(rec.text);
            history_node.prepend(rec.node);
            history.push(rec);
        }
        else
        {
            if(this.data.clicks !== undefined)
            {
                this.data.clicks += 1;
                if(this.data.clicks >= 2)
                {
                    console.log('double click: '+this.id);                    
                    delete self.data.clicks;
                    state = 'connection';
                    this.drawAnchor({type: 'origin'});
                }
            }
            else
            {
                this.data.clicks = 1;
                dblClickTimer = setTimeout(
                    function()
                    {
                        delete self.data.clicks;
                    },
                    1000);
            }
        }
        this.alpha = 1;
        this.dragging = false;
        this.data.drag = null;
    }
    function onDragMove() 
    {
        if(this.dragging)
        {
            const pointer_position = this.data.drag.eventData.getLocalPosition(this.parent);
            this.x = pointer_position.x;
            this.y = pointer_position.y;
            this.calculateAnchor();
        }
    }
    function randomColor()
    {
        return Math.round(Math.random() * 16777216);
    }
    class DemoObject extends PIXI.Graphics 
    {
        id = null;        
        type = null;
        color = null;
        size = null;
        anchor = {};
        constructor(id)
        {
            super();
            let types = ['rectangle', 'circle'];
            this.id = id;
            this.color = randomColor();
            this.size = Math.round(Math.random() * 64) + 16;
            // this.graphics = new DemoObject();
            this.lineStyle(4, this.color, 1);
            this.beginFill(this.color, .5);
            let type = types[Math.round(Math.random() * (types.length - 1))];
            switch(type)
            {
                case 'rectangle':
                    this.type = 'rectangle';
                    this.drawRect(0, 0, this.size, this.size);
                    break;
                case 'circle':
                    this.type = 'circle';
                    this.drawEllipse(0, 0, this.size, this.size);
                    break;
            }
            this.endFill();
            this.x = Math.random() * app.screen.width;
            this.y = Math.random() * app.screen.height;
            this.interactive = true;
            this.buttonMode = true;
            this.data = {};
            this.calculateAnchor();            
            this
                .on('pointerdown', onDragStart)
                .on('pointerup', onDragEnd)
                .on('pointerupoutside', onDragEnd)
                .on('pointermove', onDragMove)
                .on('pointerover', this.onOver)
                .on('pointerout', this.onOut);
        }
        onOver()
        {
            if(state === 'connection')
            {
                this.drawAnchor({type: 'target'});
            }
        }
        onOut()
        {
            if(state === 'connection')
            {
                this.eraseAnchor();
            }
        }
        calculateAnchor()
        {
            switch(this.type)
            {
                case 'rectangle':
                    this.anchor.x = this.x + this.size * .5;
                    this.anchor.y = this.y + this.size * .5;
                    break;
                case 'circle':
                    this.anchor.x = this.x;
                    this.anchor.y = this.y;
                    break;
            }
        }
        drawAnchor(o = {})
        {
            if(this.anchor.graphics !== undefined)
            {
                return;
            };
            if(o.type === undefined)
            {
                o.type = 'default';
            }
            this.anchor.type = o.type;
            let obj = new Graphics();
            if(['default', 'origin'].includes(o.type))
            {
                obj.color = 0xfcd423;
            }
            if(['target'].includes(o.type))
            {
                obj.color = 0xff0000;
            }
            obj.size = 10;
            obj.lineStyle(4, obj.color, 1);
            obj.beginFill(obj.color, .5);
            obj.drawRect(0, 0, obj.size, obj.size);
            obj.endFill();
            obj.x = this.anchor.x - obj.size * .5;
            obj.y = this.anchor.y - obj.size * .5;
            // obj.interactive = true;
            obj.buttonMode = true;
            /*
            obj
                .on('pointerdown', onDragStart)
                .on('pointerup', onDragEnd)
                .on('pointerupoutside', onDragEnd)
                .on('pointermove', onDragMove);
            */ 
            this.anchor.graphics = obj;
            app.stage.addChild(obj);
        }
        eraseAnchor()
        {
            if(this.anchor.graphics === undefined)
            {
                return;
            }
            if(this.anchor.graphics !== undefined && this.anchor.type === 'origin')
            {
                return;
            }
            app.stage.removeChild(this.anchor.graphics);
            delete this.anchor.graphics;    
        }
    }

    var history = [];
    var objects = [];
    var state = 'arrangement';
    var startId = null;
    var canvas_node = $('body > div.flex > div.canvas');
    var history_node = $('body > div.flex > div.history');
    var app = new PIXI.Application({antialias: true});
    //Add the canvas that Pixi automatically created for you to the HTML document
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoResize = true;
    app.renderer.resize(canvas_node.width(), canvas_node.height());
    app.renderer.backgroundColor = 0xcccccc;
    canvas_node.append(app.view);
    var Graphics = PIXI.Graphics;
    for (let i = 0; i < 25; i++) 
    {
        let obj = new DemoObject(i);
        app.stage.addChild(obj);
        objects.push(obj);
    }
    $('#undo').on('click', 
        function(e)
        {
            if(history.length > 0)
            {
                let rec = history.pop();
                if(rec.operation === 'move')
                {
                    objects[rec.details.id].x = rec.details.x;
                    objects[rec.details.id].y = rec.details.y;
                    rec.node.remove();               
                }
                console.log('undo');
            }
        });
    $(document).keydown(
        function(e)
        {
            console.log('keyCode: '+e.keyCode);
            if(e.keyCode === 27)
            {
                state = 'arrangement';
            }
            if(e.keyCode === 13)
            {
                state = 'arrangement';
            }
        })
}
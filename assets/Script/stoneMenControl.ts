
import { _decorator, Component, Node, systemEvent, SystemEvent, EventKeyboard, Vec3, tween, EventMouse, SkeletalAnimation, Vec2 } from 'cc';
const { ccclass, property } = _decorator;
enum StoneManState {
    walk,
    jump,
    await,
    heavyAttack,
    dead,
    leftThorn,
    rightThorn
}
@ccclass('StoneMenControl')
export class StoneMenControl extends Component {
    private MoveSpeed: number = 0;//运动速度
    private MoveRata: number = 0;//运动方向
    private Jumping: boolean = false;//正在跳跃
    private JumpSpeed: number = 0;//跳跃速度
    private Gravity: number = 9.8;//重力加速度
    private JumpTime: number = 1;//跳跃时间
    private PastTime: number = 0;//跳起之后过的时间
    private RotaSpeedY: number = 0;//旋转角
    private Camera: Node = null;
    private CPosition: Vec3 = new Vec3();
    /**上一个状态 */
    private LastState: StoneManState = StoneManState.await;
    /**当前状态 */
    private MoveState: StoneManState = StoneManState.await;
    private TranDoll: Node;
    private StoneMan: Node;
    private Bone: SkeletalAnimation;
    // private lastState: StoneManState = new;

    private BaseMoveSpeed: number = 3.0;
    private BaseRotaSpeed: number = 20;

    private SelfPos: Vec3 = new Vec3();
    private SelfRota: Vec3 = new Vec3();
    private DeltaPos: Vec3 = new Vec3();
    private DeltaRota: Vec3 = new Vec3();

    start() {
        console.log("脚本加载完成");
        this.StoneMan = this.node.getChildByName("StoneMen_yidong");
        this.Bone = this.StoneMan.getComponent(SkeletalAnimation);
        this.Bone.clips[1].events.push({
            frame: 0.1, // 第 0.5 秒时触发事件
            func: "FunTest", // 事件触发时调用的函数名称
            params: [], // 向 `func` 传递的参数
        });
        this.Bone.clips[1].updateEventDatas();
        console.log(this.Bone.clips[1])
        this.Bone.play("Take 001")
        // let clips = this.Bone.clips;
        // let state = this.Bone.getState(clips[0].name)
        // // state.lo
        // clips[0].wrapMode = 2;

        console.log(this.node.getChildByName("StoneMen_yidong"))
        systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.walk, this);
        this.Camera = this.node.getChildByName("Main Camera");
        this.CPosition = this.Camera.getPosition();
        this.TranDoll = this.node.parent.getChildByName("TranDoll");
        systemEvent.on(SystemEvent.EventType.KEY_UP, () => {
            this.MoveSpeed = 0;
            this.MoveRata = 0;
            this.RotaSpeedY = 0;
            if (this.MoveState == StoneManState.walk) {
                this.scheduleOnce(() => this.MoveState = StoneManState.await, 0.1)
            }
        }, this);
        systemEvent.on(SystemEvent.EventType.MOUSE_MOVE, this.CameraSpin, this);
        systemEvent.on(SystemEvent.EventType.MOUSE_LEAVE, () => {
            this.RotaSpeedY = 0
        }, this);
    }
    walk(event: EventKeyboard): void {
        // console.log(event.keyCode);
        // this.Bone.play("Take yidong");
        switch (event.keyCode) {
            case 87:
                this.MoveRata = this.node.eulerAngles.y
                this.MoveSpeed = -1 * this.BaseMoveSpeed;
                this.MoveState = StoneManState.walk;
                break;
            case 83:
                this.MoveRata = this.node.eulerAngles.y
                this.MoveSpeed = this.BaseMoveSpeed;
                this.MoveState = StoneManState.walk;
                break;
            case 65:
                this.MoveRata = this.node.eulerAngles.y - 90
                this.MoveSpeed = this.BaseMoveSpeed;
                this.MoveState = StoneManState.walk;
                break;
            case 68:
                this.MoveRata = this.node.eulerAngles.y + 90
                this.MoveSpeed = this.BaseMoveSpeed;
                this.MoveState = StoneManState.walk;
                break;

            case 32:
                //空格
                this.JumpSpeed = 8;
                this.Jumping = true
                this.MoveState = StoneManState.jump;
                break;
            case 81:
                //Q
                this.MoveState = StoneManState.heavyAttack;
                break;
            case 69:
                //E
                this.MoveState = StoneManState.leftThorn;
                break;
            case 71:
                //G
                this.MoveState = StoneManState.dead;
                break;
            case 82:
                let StoneManRota = this.StoneMan.eulerAngles
                this.StoneMan.eulerAngles = new Vec3(StoneManRota.x, StoneManRota.y + 180, StoneManRota.z)
        }
        this.node.getPosition();
    }
    CameraSpin(event: EventMouse): void {
        // console.log(event.getDeltaX());
        this.RotaSpeedY = -event.getDeltaX() * this.BaseMoveSpeed * 2;
    }
    CameraPull(DT: number): void {

    }
    changeState() {
        if (this.LastState !== this.MoveState) {
            this.LastState = this.MoveState;
            // this.Bone.play("")
            switch (this.MoveState) {
                case StoneManState.walk:
                    this.Bone.crossFade("Take yidong", 1);
                    break;
                case StoneManState.jump:
                    this.Bone.play("Take 001");
                    break;
                case StoneManState.await:

                    this.Bone.play("Take 001");
                    break;
                case StoneManState.heavyAttack:
                    this.Bone.crossFade("Take heavyAttack", 1);
                    tween(this.Camera)
                        .delay(.5)
                        .to(0.1, { position: new Vec3(this.CPosition.x, this.CPosition.y + .2, this.CPosition.z + .5) })
                        .to(0.1, { position: new Vec3(this.CPosition.x, this.CPosition.y - .2, this.CPosition.z - .5) })
                        .to(0.1, { position: new Vec3(this.CPosition.x, this.CPosition.y + .1, this.CPosition.z + .2) })
                        .to(0.1, { position: new Vec3(this.CPosition.x, this.CPosition.y - .1, this.CPosition.z - .2) })
                        .to(0.1, { position: new Vec3(this.CPosition.x, this.CPosition.y, this.CPosition.z) })

                        .start()
                    // this.scheduleOnce(() => this.MoveState = StoneManState.await, 1.42)
                    break;
                case StoneManState.leftThorn:
                    this.Bone.play("Take leftThorn");
                    // this.scheduleOnce(() => this.MoveState = StoneManState.await, 0.92)
                    break;
                case StoneManState.rightThorn:
                    this.Bone.play("Take rightThorn");
                    // this.scheduleOnce(() => this.MoveState = StoneManState.await, 0.92)
                    break;
                case StoneManState.dead:
                    // const { defaultClip } = this.Bone;

                    this.Bone.crossFade("Take die", 1);
                    // this.scheduleOnce(() => this.MoveState = StoneManState.await, 1.33)
                    break;
            }
        }
    }
    update(deltaTime: number): void {
        this.DeltaRota.y = this.RotaSpeedY * deltaTime;
        let rad = (this.MoveRata % 360 / 180) * Math.PI;
        this.DeltaPos.x = this.MoveSpeed * deltaTime * Math.sin(rad);
        this.DeltaPos.z = this.MoveSpeed * deltaTime * Math.cos(rad);
        if (this.Jumping) {
            if (this.PastTime < this.JumpTime) {
                this.PastTime += deltaTime;
                this.DeltaPos.y = (this.JumpSpeed - this.Gravity * this.PastTime) * deltaTime;
                this.Camera.setPosition(this.CPosition.x, this.CPosition.y, this.CPosition.z += this.DeltaPos.y)
            } else {
                if (this.SelfPos.y > .5) {
                    this.PastTime -= deltaTime;
                    this.DeltaPos.y = (- this.Gravity * this.PastTime) * deltaTime;
                    this.Camera.setPosition(this.CPosition.x, this.CPosition.y, this.CPosition.z += this.DeltaPos.y)
                } else {
                    this.DeltaPos.y = 0;
                    this.JumpSpeed = 0;
                    this.PastTime = 0;
                    this.Jumping = false;
                    console.log("停止跳跃");
                }
            }
            // console.log(this.PastTime, this.JumpTime, this.SelfPos)
        } else {

        }
        // console.log(rad, this.DeltaPos);
        Vec3.add(this.SelfRota, this.node.eulerAngles, this.DeltaRota);
        Vec3.add(this.SelfPos, this.SelfPos, this.DeltaPos);
        this.node.setWorldPosition(this.SelfPos);
        this.node.eulerAngles = this.SelfRota;
        this.changeState();
        this.HeavyAttack();
    }
    //判断攻击
    HeavyAttack() {
        let SelfPosW = this.node.getWorldPosition();
        let DollPosW = this.TranDoll.getWorldPosition();

        // let closeX: boolean = Math.abs(SelfPosW.x - DollPosW.x) < 10;
        // let closeZ: boolean = Math.abs(SelfPosW.z - DollPosW.z) < 10;
        //判断距离
        let distance = Math.pow(SelfPosW.x - DollPosW.x, 2) + Math.pow(SelfPosW.z - DollPosW.z, 2)
        //判断是否在攻击角度内
        if (distance > 99) {
            return
        }
        let B = new Vec3(SelfPosW.x + 10 * Math.sin(this.node.eulerAngles.y), SelfPosW.y, SelfPosW.z + 10 * Math.cos(this.node.eulerAngles.y));
        let AB = new Vec3(SelfPosW.x - B.x, 0, SelfPosW.z - B.z);
        let AC = new Vec3(SelfPosW.x - DollPosW.x, 0, SelfPosW.z - DollPosW.z);
        // let a = (AB.x * AC.x + AB.y * AC.y) / (Math.sqrt(Math.pow(AB.x, 2) + Math.pow(AB.y, 2)) * Math.sqrt(Math.pow(AC.x, 2) + Math.pow(AC.y, 2)))
        // let aTrue = Math.acos(a);
        // console.log(this.SelfRota.y, aTrue * 90, a)
        console.log(Vec3.angle(AB, AC) * 180 / Math.PI)
    }
    public FunTest(): void {
        console.log("动画帧事件")
    }
}

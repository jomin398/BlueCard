class Blue extends BlueCard {
    constructor(trasScrc, editEnable, elmQstr) {
        super();
        this.init(trasScrc, editEnable, elmQstr)
            .then(() => this.reflash()).then(()=>this.apply())
    }
    change(data){
        this.apply(data);
    }
};
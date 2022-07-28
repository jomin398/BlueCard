class Gui {
    constructor(editEnable, elmQstr) {
        this.elmQstr = elmQstr;
        this.elm = null;
        this.edit = editEnable;
        this.templateStr = null;
        this.tempElem = null;
    }
}

class BlueCard {
    constructor() {
        this.schPre = {};
        this.ll = {};
    }
    #templateUrl = './template.html';
    #assetUrl = './asset/';
    #cssLoader(url, remove) {
        return new Promise(res => {
            let l = document.querySelector(`link[rel="stylesheet"][href="${url}"]`);

            if (!remove) {
                if (!l) {
                    l = document.createElement('link');
                    l.href = url;
                    l.rel = "stylesheet";
                    l.onload = () => res(true);
                    document.head.appendChild(l)
                }
            } else if (l && remove) {
                l.remove();
            }

        })
    }
    imageSave() {
        // document.querySelector
        document.body.classList.add('iSave');
        const cssUrl = this.gui.cssUrl;
        this.#cssLoader(cssUrl, true);
        domtoimage.toPng(document.body.querySelector('.char_wrap'), { cacheBust: true })
            .then(dataUrl => {
                var link = document.createElement('a');

                link.download = document.querySelector('#name_e').innerText;
                link.href = dataUrl;
                link.click();

                document.body.classList.remove('iSave');
                this.#cssLoader(this.gui.cssUrl)
            });
    };
    init(trasScrc, editEnable, elmQstr) {
        if (!trasScrc) throw new ReferenceError('param is cannot be null.');
        L10N.l('ko')
        L10N.append(trasScrc); //localText
        this.ll.en = Object.keys(L10N.data).filter(e => e.includes('local')).map(e => e.replace('local_', ''));
        this.ll.trans = this.ll.en.map(e => L10N.t(`local_${e}`));
        this.schPre.keys = Object.keys(L10N.data).filter(e => e.includes('sch_prefix'));
        this.schPre.trans = this.schPre.keys.map(e => L10N.t(e));
        this.gui = new Gui(editEnable, elmQstr);
        this.gui.cssUrl = 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@latest/css/all.min.css';
        this.#cssLoader(this.gui.cssUrl)
        if (this.gui.elmQstr) this.gui.elm = document.querySelector(`.${this.gui.elmQstr}`);
        console.log('load template');
        return fetch(this.#templateUrl)
            .then(d => d.text())
            .then(str => this.gui.templateStr = str);

    };
    #domParse(str) {
        console.log('template is loaded.');
        return new DOMParser().parseFromString(str, "text/html").body;
    }
    #TempData = {
        d: [
            undefined,
            "시로코",
            "SHIROKO",
            "小倉唯",
            "お ぐら ゆい",
            "abydos",
            "",
            "0",
            "",
            undefined,
            "2",
            "5.16",
            "156",
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        t: true
    }
    #addForm() {
        const dispElem = this.gui.elm;
        let form = null;
        let menu = document.querySelector('ul.side');
        if (document.forms.length == 0) {
            document.querySelector('.char_wrap').style.display = 'none';
            dispElem.insertAdjacentElement('beforeend', this.gui.tempElem.querySelector('form'));
            form = document.forms[0];
            form.querySelector('label[for="chrL"]').insertAdjacentElement('afterend', (() => {
                let s = document.createElement('select');
                s.name = 'chrL';
                s.id = 'chrL';
                this.ll.trans.map((str, i) => {
                    let o = document.createElement('option');
                    o.value = this.ll.en[i];
                    o.innerText = str;
                    if (i == 0) o.selected = true;
                    s.append(o)
                })
                return s;
            })());
            form.querySelector('label[for="chrSchPref"]').insertAdjacentElement('afterend', (() => {
                let s = document.createElement('select');
                s.name = 'chrSch';
                s.id = 'chrSch';
                this.schPre.trans.map((str, i) => {
                    let o = document.createElement('option');
                    o.value = i;
                    o.innerText = str;
                    if (i == 0) o.selected = true;
                    s.append(o)
                })
                return s;
            })());
            form.classList.add('show');
            window.submitAction = () => this.submitAction();
            form.action = 'javascript:submitAction()';

            //form.addEventListener('submit',()=>this.submitAction.bind(this)())

            if (menu) {
                menu.classList.add('f');
                menu.querySelectorAll('li.f')[0].onclick = () => {
                    if (menu.classList.contains('f')) menu.classList.remove('f');
                    document.forms[0].submit();
                };
                menu.querySelectorAll('li.f')[1].onclick = () => {
                    document.forms[0].reset();
                };
            };
        };
    }
    #addEv() {
        console.log('append ToolTebs')
        let elm = document.querySelector('ul.side');
        if (!elm) {
            document.body.insertAdjacentElement('beforeend', this.gui.tempElem.querySelector('ul.side'));
            elm = document.querySelector('ul.side')
        };
        elm.querySelector('ul.side li:nth-child(1)').onclick = () => this.#addForm();
        elm.querySelector('ul.side li:nth-child(2)').onclick = () => this.imageSave();
    }
    submitAction() {
        const form = document.forms[0];
        const formData = Array.from(form.querySelectorAll('input, select'));
        let t = false;
        let data = formData.map((e, i) => {
            if (e.type == 'file') {
                return e.files[0];
            } else if (e.type == 'checkbox') {
                return e.checked;
            }
            else if (e.value == '') {
                if (i == 1) t = true;
                return e.placeholder;
            } else {
                return e.value;
            }
        });
        form.style.display = 'none';
        this.reflash().then(this.apply({ d: data, t: t }))
    }
    reflash() {
        console.log('reflash data');
        this.gui.elm.remove();
        document.body.insertAdjacentHTML('afterbegin', `<div class="${this.gui.elmQstr}" id="job1"></div>`);
        this.gui.elm = document.querySelector(`.${this.gui.elmQstr}`);
        //parse template;
        this.gui.tempElem = this.#domParse(this.gui.templateStr);
        this.gui.elm.insertAdjacentElement('afterbegin', this.gui.tempElem.querySelector('.char_wrap'));
        if (this.gui.edit) this.#addEv();
        return Promise.resolve(true)
    };
    #imageView(f, elm) {
        return new Promise(res => {
            const reader = new FileReader();
            reader.onload = e => res([e, f])
            reader.readAsDataURL(f);
        }).then(a => {
            elm.setAttribute('src', a[0].target.result);
            elm.setAttribute('data-file', a[1].name);
        })
    }
    apply(data) {
        data = data ?? this.#TempData;
        console.log('gen chr card')
        console.log(data)
        const selectorList = ['name', 'name_e'];
        const chrInfo = document.querySelector('.char_info');
        const descElmLst = chrInfo.querySelectorAll('dd');
        data.d.map((e, i) => {
            switch (i) {
                case 0:
                case 9:
                    let img = document.querySelectorAll('img')[i == 9 ? 1 : 0];
                    if (e) {
                        // console.log(e)
                        this.#imageView(e, img);
                    } else {
                        let url = this.#assetUrl;

                        url += (i == 0 ? '01_m_shiroko.png' : 'sch/School_Icon_');
                        img.src = i == 0 ? url : data.d[5] != 'unset' ? `${url}${data.d[5].toUpperCase()}.png` : '';
                    };
                    img.parentElement.style.border = 'none';
                    break;
                case 1:
                    document.getElementById(selectorList[0]).innerText = e;
                    break;
                case 2:
                    document.getElementById(selectorList[i - 1]).innerText = e;
                    if (data.d[20] == true) {
                        JsBarcode('canvas#barcode', e, {
                            format: "code128", width: 1.3,
                            height: 18,
                            margin: 1,
                            lineColor: getComputedStyle(document.querySelector('#svg_1')).fill,
                            displayValue: false
                        });
                        const bcodeElm = document.querySelector('canvas#barcode');
                        bcodeElm.classList.add('show');
                        bcodeElm.title = e + ' barcode';
                        document.getElementById('name_e').innerHTML = e;
                        //auto transform margin
                        let bcode = getComputedStyle(bcodeElm);
                        let bcodeW = parseInt(bcode.width);
                        if (bcode >= 149) {
                            bcodeElm.style.top = `${parseInt(bcode.top) + (bcodeW - 149)}px`;
                        } else if (bcodeW <= 149) {
                            bcodeElm.style.top = `${parseInt(bcode.top) + (bcodeW - 149)}px`;
                        }
                    }
                    break;

                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 10:
                case 11:
                case 12:
                    if (i == 5 && e != 'unset') document.querySelector('.shLocal').innerHTML = L10N.t(`local_${e}`);
                    //3,5,7
                    if (i < 10) {
                        if (i % 2 == 1) {
                            for (let j = 0; j < 2; j++) {
                                let elm = document.createElement(i == 3 && j == 1 ? 'ruby' : 'span');
                                if (j == 0) {
                                    elm.innerText = `${L10N.t(i == 3 ? 'cv' : i == 5 ? 'locale' : 'school')} : `;
                                    if (i > 3) elm.className = i == 5 ? 'lo' : 'sh';
                                } else {
                                    elm.id = i == 3 ? 'cv' : i == 5 ? 'lo' : 'sh';
                                    elm.innerText = i == 3 ? e : i == 5 ? L10N.t(`local_${e}`) : `${document.getElementById('lo').innerHTML} ${this.schPre.trans[parseInt(e)]}`;
                                };
                                if (i > 3) {
                                    if (i < 7) { descElmLst[i - 3].append(elm) } else {
                                        descElmLst[3].append(elm);
                                    };

                                } else {
                                    descElmLst[1].append(elm);
                                };
                            }
                        }
                        //4,6,8
                        if ((i % 2 == 0) && e != '') {
                            let elm = i == 4 ? descElmLst[0] : document.getElementById(i == 6 ? 'lo' : 'sh');
                            elm.innerText = e;
                        }
                    } else {
                        let id = ['grade', 'bthd', 'height'][i - 10];
                        for (let j = 0; j < 2; j++) {
                            let elm = document.createElement('span');

                            if (j == 0) {
                                elm.innerText = `${L10N.t(id)} : `;
                                elm.className = id;
                            } else {
                                elm.id = id;
                                // elm.innerText = ;
                                if (i == 11) {
                                    let bday = e.split('.');
                                    elm.innerHTML = L10N.t('chr_bthd', bday[0], bday[1])
                                } else {
                                    elm.innerHTML = `${parseInt(e)} ${i == 10 ? L10N.t('grade') : 'cm'}`;
                                }
                            };
                            descElmLst[i - 6].append(elm);
                        }
                    }
                    break;

                case 13:
                case 14:
                case 15:
                case 16:
                case 17:
                case 18:
                case 19:
                case 20:
                    if (i == 13 && e == false) {
                        document.querySelector('.char_info dd.tt.j').style.display = 'none';
                        document.querySelector('.char_info :nth-child(3)').style.display = 'none';
                    }
                    if (i > 13 && i < 19) {
                        if (e == false) document.querySelector(`dl.char_info :nth-child(${i - 10})`).style.display = 'none';
                        if (i == 14 && e == false) document.querySelector('.shLocal').style.display = 'none';
                    }
                    if (e == true && i == 19) document.querySelector('.sch_logo').classList.add('show');
                    if (i == 20 && e == false) document.querySelector('canvas').style.display = 'none';
                    break;
                default:
                    break;
            }
        })
    }
}
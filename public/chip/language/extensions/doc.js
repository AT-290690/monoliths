export const DOCUMENTATION = {
  CANVAS: {
    NAME: 'CANVAS',
    quickcanvas: `[w; h; border] -> ctx`,
    clearrect: `[ctx; x; y; width; height] -> ctx`,
    drawimage: `[
    ctx;
    image;
    sx;
    sy;
    sWidth;
    sHeight;
    dx;
    dy;
    dWidth;
    dHeight
  ] -> ctx`,
    setfillstyle: `[ctx; color] -> ctx`,
    makefilledrect: `[ctx, x, y, w, h] -> ctx`,
    setstrokestyle: `[ctx, color] -> ctx`,
    setlinewidth: `[ctx, width] -> ctx`,
    makestroke: `[ctx] -> ctx`,
    makepath: `[ctx] -> ctx`,
    moveto: `[ctx, x, y] -> ctx`,
    lineto: `[ctx, x, y] -> ctx`,
  },
  DOM: {
    NAME: 'DOM',
    appendchild: `[parent, child] -> parent`,
    getbody: `[] -> .[document; "body"]`,
    getparentnode: `[element] -> . [element; "parentNode"]`,
    makefragment: `[] -> fragment`,
    getelementbyid: `[id] -> element`,
    getelementsbyclassname: `[tag] -> elements`,
    getelementsbytagname: `[tag] -> element`,
    makeuserinterface: `[] -> div`,
    makeimage: `[src] -> img`,
    makeiframe: `[src] -> iframe`,
    makeelement: `[type, settings] -> element`,
    makecanvas: `[settings] -> element`,
    makeinput: `[settings] -> element`,
    maketextarea: `[settings] -> element`,
    makecheckbox: `[] -> checkbox`,
    makeslider: `[settings] -> element`,
    copyfromelement: `[copy element] -> copy`,
    copyfromtext: `[val] -> void`,
    maketooltip: `[defaultLabel] -> tooltip`,
    maketable: `[content] -> element`,
    maketablerow: `[content] -> element`,
    maketabledata: `[content] -> element`,
    maketableheader: `[content] -> element`,
    maketablecaption: `[content] -> element`,
    maketablecolumn: `[content] -> element`,
    maketablecolumngroup: `[content] -> element`,
    maketablehead: `[content] -> element`,
    maketablebody: `[content] -> element`,
    maketablefooter: `[content] -> element`,
    makebutton: `[] -> element`,
    makelabel: `[element, label] -> element`,
    makeheader: `[content, n] -> element`,
    makelist: `[content] -> element`,
    makecsslink: `[href] -> element`,
    makeorderedlist: `[...lists] -> element`,
    makeunorderedlist: `[...lists] -> element`,
    makeanchor: `[content, href] -> element`,
    makepre: `[content] -> element`,
    makeparagraph: `[content] -> element`,
    makespan: `[content] -> element`,
    setid: `[element, id] -> element`,
    maketablefrom: `[tableData] -> element`,
    getid: `[element] -> attribute`,
    getattribute: `[element, key] -> attribute`,
    setattribute: `[element, key, value] -> element`,
    settextcontent: `[element, content] -> element`,
    setstyle: `[element, ...styles] -> element`,
    makecontainer: `[...elements] -> element`,
    makediv: `[...elements] -> element`,
    makeitalictext: `[content] -> element`,
    insertintocontainer: `[container, ...elements] -> element`,
    removeselffromcontainer: `[...elements] -> element`,
  },
  STYLE: {
    NAME: 'STYLE',
    makestyle: `[...styles] -> element`,
    addclass: `[element, ...classlist] -> element`,
    noborder: `[] -> string`,
    borderradius: `[value] -> string`,
    border: `[options] -> string`,
    margin: `[options] -> string`,
    padding: `[options] -> string`,
    display: `[display] -> string`,
    unitspercent: `[value] -> string`,
    unitspixel: `[value] -> string`,
    unitspoint: `[value] -> string`,
    backgroundcolor: `[color] -> string`,
    resetcss: `[] -> element`,
    cursorpointer: `[] -> string`,
    fontfamily: `[font] -> string`,
    fontsize: `[size] -> string`,
    displayshow: `[element] -> string`,
    displayhide: `[element] -> string`,
    textcolor: `[color] -> string`,
    textalign: `[align] -> string`,
    styleoption: `[attr] -> option`,
  },
  EVENT: {
    NAME: 'EVENT',
    oninputchange: `[element, callback] -> element`,
    onmouseclick: `[element, callback] ->  element`,
    onmouseover: `[element, callback] -> element`,
    onkeydown: `[element, callback] -> element`,
    onkeyup: `[element, callback] -> element`,
  },
}
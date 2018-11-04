const inputStr = `<input class="remark-input" value="{{value}}" data-key="{{key}}" type="text" style="background: transparent;border: none;color: #736e6ed6;font-weight: 600;font-size: 14px;width: 100%;outline: none;margin-bottom: 5px;" placeholder="remark..." />`
let extend = {};
genElem = function (elemStr) {
    let div = document.createElement("div");
    div.innerHTML = elemStr;
    return div;
};

saveRemark = function (key, value, username) {
    if (!(key in extend["remarks"]) && value === "") {
        return
    }

    if (key in extend["remarks"] && extend["remarks"][key] == value) {
        return
    }

    chrome.storage.sync.get({"extend": {"remarks": {}}}, function (items) {
        let isDelete = false;
        if (key in extend["remarks"] && value === "") {
            delete items["extend"]["remarks"][key];
            isDelete = true;
        } else {
            items["extend"]["remarks"][key] = value;
        }

        chrome.storage.sync.set(items);
        extend = items["extend"];

        let opt = document.getElementsByClassName("option-" + key);
        let remarkList = document.getElementById("remark-list");

        if (!opt[0]) {
            let str = "<option class='option-" + key + "' value='" + key.replace(username + "/", "") + "'>" + extend["remarks"][key] + "</option>";
            remarkList.appendChild(genElem(str));
        } else if (!isDelete) {
            opt[0].text = value;
        } else if (isDelete) {
            opt[0].parentNode.removeChild(opt[0]);
        }
    })
};

getInputStr = function (key) {
    let str = inputStr.replace("{{key}}", key);
    if (key in extend["remarks"]) {
        str = str.replace("{{value}}", extend["remarks"][key]);
    } else {
        str = str.replace("{{value}}", "");
    }
    return str
};

//自己的star页
initInputStar = function (username) {
    let lists = document.querySelectorAll("div.position-relative > .col-12.d-block.width-full.py-4.border-bottom");
    let py3 = document.querySelector("#js-pjax-container > div > div.col-9.float-left.pl-2 > div.position-relative > div.TableObject.border-bottom.border-gray-dark.py-3");
    if (!lists || !py3) {
        return
    }

    for (let i = 0; i < lists.length; i++) {
        let mb1 = lists[i].querySelector(".d-inline-block.mb-1");
        let key = username + mb1.querySelector("h3 a").getAttribute("href");
        let path = genElem(getInputStr(key));
        mb1.parentNode.insertBefore(path, mb1.nextSibling);
    }

    let py3Sib = py3.nextSibling;
    let listInput = genElem(`
    <input class="search-remark form-control width-full" type="list" list="remark-list"/>
    <div style="width: 100%; overflow: auto;" ><datalist id="remark-list"></datalist></div>
    `);
    py3Sib.parentNode.insertBefore(listInput, py3Sib.nextSibling);

    listInput.addEventListener("change", function (e) {
        let path = e.target.value;
        if (username + "/" + path in extend["remarks"]) {
            window.location.href = e.target.value;
        }
    });

    let remarkList = document.getElementById("remark-list");
    let remarks = extend["remarks"];
    for (let key in remarks) {
        let str = "<option class='option-" + key + "' value='" + key.replace(username + "/", "") + "'>" + remarks[key] + "</option>";
        remarkList.appendChild(genElem(str));
    }

};

//自己的仓库列表页
initInputRepoList = function (username) {
    let lists = document.querySelectorAll("#user-repositories-list > ul > li");
    if (!lists) {
        return
    }

    for (let i = 0; i < lists.length; i++) {
        let mb1 = lists[i].querySelector(".d-inline-block.mb-1");
        let key = username + mb1.querySelector("h3 a").getAttribute("href");
        let pathElem = genElem(getInputStr(key));
        let parent = mb1.parentNode;
        if (parent.lastChild == mb1) {
            parent.appendChild(pathElem);
        } else {
            parent.insertBefore(pathElem, mb1.nextSibling);
        }
    }
};

//项目主页
initInputRepoInfo = function (username) {
    let div = document.querySelector("#js-repo-pjax-container > div.pagehead.repohead.instapaper_ignore.readability-menu.experiment-repo-nav > div");
    if (!div) {
        return
    }
    let key = username + div.querySelector("h1 > strong > a").getAttribute("href");
    let pathElem = genElem(getInputStr(key));
    div.appendChild(pathElem);
};

init = function (username) {

    initInputStar(username);
    initInputRepoList(username);
    initInputRepoInfo(username);

    let inputs = document.getElementsByClassName("remark-input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("blur", function (e) {
            let input = e.target;
            let key = input.dataset.key;

            saveRemark(key, input.value, username);
        });
    }


};

window.onload = function () {
    const username = document.querySelector("meta[name='user-login']").getAttribute("content");
    chrome.storage.sync.get({"extend": {"remarks": {}}}, function (items) {
        //方便后续快速查询
        extend = items["extend"];

        init(username);
    });

    document.addEventListener("pjax:complete", function () {
        init(username);
    })
};
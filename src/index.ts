interface GrimoireWindow extends Window {
    GrimoireJS: any;
}
async function waitForDOMContentLoaded() {
    return new Promise<void>(resolve => {
        document.addEventListener("DOMContentLoaded", () => {
            resolve();
        });
    });
}

async function obtainAllScript() {
    await waitForDOMContentLoaded();
    const tags = document.getElementsByTagName("script");
    const result = [];
    for (let i = 0; i < tags.length; i++) {
        result.push(tags.item(i));
    }
    return result;
}

async function obtainScriptWithAs() {
    const tags = await obtainAllScript();
    return tags.filter(t => !!t.getAttribute("as"));
}

function parseHash() {
    const result = {} as { [key: string]: string };
    if (window.location.hash) {
        const hash = window.location.hash;
        const hashes = /#(.*)/.exec(hash)[1].split("&");
        for (const oneHash of hashes) {
            const splitted = /([a-zA-Z0-9\-]+)=([a-zA-Z0-9\-\._\/]+)/.exec(oneHash);
            result[splitted[1]] = splitted[2];
        }
    }
    return result;
}

async function rewriteScript(script: HTMLScriptElement, version: string) {
    const libShort = script.getAttribute("as");
    let requestURL = "";
    let libSuffix = "-" + libShort;
    if (libSuffix === "-grimoirejs") {
        libSuffix = "";
    }
    if (/^staging-.+/m.test(version)) {
        const sha1 = /^staging-(.+)/m.exec(version)[1];
        requestURL = `https://ci.grimoire.gl/js/${sha1}/grimoire${libSuffix}.js`;
    } else {
        if (version) {
            requestURL = `https://unpkg.com/grimoirejs${libSuffix}@${version}/register/grimoire${libSuffix}.js`;
        } else {
            requestURL = `https://unpkg.com/grimoirejs${libSuffix}/register/grimoire${libSuffix}.js`;
        }
    }

    return new Promise((resolve, reject) => {
        script.onload = () => {
            resolve();
        };
        script.setAttribute("src", requestURL);
    });
}

async function exec() {
    const scripts = await obtainScriptWithAs();
    const hashes = parseHash();
    for (let i = 0; i < scripts.length; i++) {
        await rewriteScript(scripts[i], hashes[scripts[i].getAttribute("as")]);
    }
}

const gwin = window as GrimoireWindow;
gwin.GrimoireJS = {
    postponeLoading: exec(),
};

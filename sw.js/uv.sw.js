(()=>{
    "use strict";
    const e = self.Ultraviolet
      , t = ["cross-origin-embedder-policy", "cross-origin-opener-policy", "cross-origin-resource-policy", "content-security-policy", "content-security-policy-report-only", "expect-ct", "feature-policy", "origin-isolation", "strict-transport-security", "upgrade-insecure-requests", "x-content-type-options", "x-download-options", "x-frame-options", "x-permitted-cross-domain-policies", "x-powered-by", "x-xss-protection"]
      , r = ["GET", "HEAD"];
    class s extends e.EventEmitter {
        constructor(t=__uv$config) {
            super(),
            t.bare || (t.bare = "/bare/"),
            t.prefix || (t.prefix = "/service/"),
            this.config = t;
            const r = (Array.isArray(t.bare) ? t.bare : [t.bare]).map((e=>new URL(e,location).toString()));
            this.address = r[~~(Math.random() * r.length)],
            this.bareClient = new e.BareClient(this.address)
        }
        async fetch({request: s}) {
            try {
                if (!s.url.startsWith(location.origin + this.config.prefix))
                    return await fetch(s);
                const n = new e(this.config,this.address);
                "function" == typeof this.config.construct && this.config.construct(n, "service");
                const c = await n.cookie.db();
                n.meta.origin = location.origin,
                n.meta.base = n.meta.url = new URL(n.sourceUrl(s.url));
                const l = new o(s,this,n,r.includes(s.method.toUpperCase()) ? null : await s.blob());
                if ("blob:" === n.meta.url.protocol && (l.blob = !0,
                l.base = l.url = new URL(l.url.pathname)),
                s.referrer && s.referrer.startsWith(location.origin)) {
                    const e = new URL(n.sourceUrl(s.referrer));
                    (l.headers.origin || n.meta.url.origin !== e.origin && "cors" === s.mode) && (l.headers.origin = e.origin),
                    l.headers.referer = e.href
                }
                const u = await n.cookie.getCookies(c) || []
                  , d = n.cookie.serialize(u, n.meta, !1);
                l.headers["user-agent"] = navigator.userAgent,
                d && (l.headers.cookie = d);
                const h = new a(l,null,null);
                if (this.emit("request", h),
                h.intercepted)
                    return h.returnValue;
                const p = await this.bareClient.fetch(l.blob ? "blob:" + location.origin + l.url.pathname : l.url, {
                    headers: l.headers,
                    method: l.method,
                    body: l.body,
                    credentials: l.credentials,
                    mode: location.origin !== l.address.origin ? "cors" : l.mode,
                    redirect: l.redirect
                })
                  , m = new i(l,p)
                  , b = new a(m,null,null);
                if (this.emit("beforemod", b),
                b.intercepted)
                    return b.returnValue;
                for (const e of t)
                    m.headers[e] && delete m.headers[e];
                if (m.headers.location && (m.headers.location = n.rewriteUrl(m.headers.location)),
                m.headers["set-cookie"] && (Promise.resolve(n.cookie.setCookies(m.headers["set-cookie"], c, n.meta)).then((()=>{
                    self.clients.matchAll().then((function(e) {
                        e.forEach((function(e) {
                            e.postMessage({
                                msg: "updateCookies",
                                url: n.meta.url.href
                            })
                        }
                        ))
                    }
                    ))
                }
                )),
                delete m.headers["set-cookie"]),
                m.body)
                    switch (s.destination) {
                    case "script":
                    case "worker":
                        {
                            const e = [n.bundleScript, n.clientScript, n.configScript, n.handlerScript].map((e=>JSON.stringify(e))).join(",");
                            m.body = `if (!self.__uv && self.importScripts) { ${n.createJsInject(this.address, this.bareClient.data, n.cookie.serialize(u, n.meta, !0), s.referrer)} importScripts(${e}); }\n`,
                            m.body += n.js.rewrite(await p.text())
                        }
                        break;
                    case "style":
                        m.body = n.rewriteCSS(await p.text());
                        break;
                    case "iframe":
                    case "document":
                        (function(t, r="") {
                            return "text/html" === (e.mime.contentType(r || t.pathname) || "text/html").split(";")[0]
                        }
                        )(n.meta.url, m.headers["content-type"] || "") && (m.body = n.rewriteHtml(await p.text(), {
                            document: !0,
                            injectHead: n.createHtmlInject(n.handlerScript, n.bundleScript, n.clientScript, n.configScript, this.address, this.bareClient.data, n.cookie.serialize(u, n.meta, !0), s.referrer)
                        }))
                    }
                return "text/event-stream" === l.headers.accept && (m.headers["content-type"] = "text/event-stream"),
                this.emit("response", b),
                b.intercepted ? b.returnValue : new Response(m.body,{
                    headers: m.headers,
                    status: m.status,
                    statusText: m.statusText
                })
            } catch (e) {
                return console.error(e),
                new Response(e.toString(),{
                    status: 500
                })
            }
        }
        static Ultraviolet = e
    }
    self.UVServiceWorker = s;
    class i {
        constructor(e, t) {
            this.request = e,
            this.raw = t,
            this.ultraviolet = e.ultraviolet,
            this.headers = {};
            for (const e in t.rawHeaders)
                this.headers[e.toLowerCase()] = t.rawHeaders[e];
            this.status = t.status,
            this.statusText = t.statusText,
            this.body = t.body
        }
        get url() {
            return this.request.url
        }
        get base() {
            return this.request.base
        }
        set base(e) {
            this.request.base = e
        }
    }
    class o {
        constructor(e, t, r, s=null) {
            this.ultraviolet = r,
            this.request = e,
            this.headers = Object.fromEntries(e.headers.entries()),
            this.method = e.method,
            this.address = t.address,
            this.body = s || null,
            this.redirect = e.redirect,
            this.credentials = "omit",
            this.mode = "cors" === e.mode ? e.mode : "same-origin",
            this.blob = !1
        }
        get url() {
            return this.ultraviolet.meta.url
        }
        set url(e) {
            this.ultraviolet.meta.url = e
        }
        get base() {
            return this.ultraviolet.meta.base
        }
        set base(e) {
            this.ultraviolet.meta.base = e
        }
    }
    class a {
        #e;
        #t;
        constructor(e={}, t=null, r=null) {
            this.#e = !1,
            this.#t = null,
            this.data = e,
            this.target = t,
            this.that = r
        }
        get intercepted() {
            return this.#e
        }
        get returnValue() {
            return this.#t
        }
        respondWith(e) {
            this.#t = e,
            this.#e = !0
        }
    }
}
)();
//# sourceMappingURL=uv.sw.js.map

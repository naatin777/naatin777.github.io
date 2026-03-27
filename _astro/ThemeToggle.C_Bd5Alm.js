import{d as C,l,m as S,g as f,n as E,a as s,i as H,e as I,c as x,t as b,s as n,o as $,p as B,r as L,F as V}from"./web.DZqlJbhb.js";/* empty css                              *//* empty css                                 */const N=`<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
        d="M21 12.79 A9 9 0 1 1 11.21 3 A5 5 0 0 0 21 12.79 Z" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linejoin="round"
    />
</svg>`,R=`<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2V4 M12 20V22 M4 12H2 M22 12H20" />
        <path d="M12 2V4 M12 20V22 M4 12H2 M22 12H20" transform="rotate(45 12 12)" />
    </g>
</svg>
`,F=`<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <line x1="8" y1="21" x2="16" y2="21" />
    </g>
</svg>`;var D="_1t6cds04 _1t6cds03 jr2hcpf jr2hcp1c jr2hcpbs jr2hcpb8",P="_1t6cds06 _1t6cds05 jr2hcpbs jr2hcpbe",Z="_1t6cds08 _1t6cds07 jr2hcpc jr2hcp1c jr2hcpx jr2hcpbs",q="_1t6cds0a _1t6cds09 jr2hcpc jr2hcp1c jr2hcpx jr2hcpaf",z=b('<div role=group aria-label="Color Theme"><span aria-hidden=true></span><!$><!/>'),G=b("<button type=button><span aria-hidden=true>");const J=[{value:"light",label:"Light",icon:R},{value:"system",label:"System",icon:F},{value:"dark",label:"Dark",icon:N}];function U(){const[d,h]=l("system"),[v,y]=l(!1),[M,j]=l(!1),i=()=>{const r=window.__theme;h(r?.get()??"system"),y(!0)},k=r=>{window.__theme?.set(r),h(r),j(!0)};return S(()=>{i(),document.addEventListener("astro:before-preparation",i),$(()=>{document.removeEventListener("astro:before-preparation",i)})}),(()=>{var r=f(z),c=r.firstChild,_=c.nextSibling,[T,A]=E(_.nextSibling);return s(r,D),s(c,P),H(r,I(V,{each:J,children:e=>(()=>{var a=f(G),o=a.firstChild;return a.$$click=()=>{k(e.value)},s(a,Z),s(o,q),x(t=>{var g=d()===e.value?"true":"false",m=`Set ${e.label} theme`,u=e.label,p=e.value,w=e.icon;return g!==t.e&&n(a,"aria-pressed",t.e=g),m!==t.t&&n(a,"aria-label",t.t=m),u!==t.a&&n(a,"title",t.a=u),p!==t.o&&n(a,"data-theme-toggle-option",t.o=p),w!==t.i&&B(o,"innerHTML",t.i=w),t},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0}),L(),a})()}),T,A),x(e=>{var a=v()?d():void 0,o=v()?"true":"false",t=M()?"true":"false";return a!==e.e&&n(r,"data-theme-active",e.e=a),o!==e.t&&n(r,"data-theme-toggle-ready",e.t=o),t!==e.a&&n(r,"data-theme-toggle-animate",e.a=t),e},{e:void 0,t:void 0,a:void 0}),r})()}C(["click"]);export{U as default};

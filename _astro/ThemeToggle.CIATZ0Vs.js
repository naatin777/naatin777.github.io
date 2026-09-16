/* empty css                              */import{t as e}from"./react.iDfmHsyG.js";import{n as t,t as n}from"./jsx-runtime.D9qPT7x6.js";var r=e(),i=`<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
        d="M21 12.79 A9 9 0 1 1 11.21 3 A5 5 0 0 0 21 12.79 Z" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linejoin="round"
    />
</svg>`,a=`<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2V4 M12 20V22 M4 12H2 M22 12H20" />
        <path d="M12 2V4 M12 20V22 M4 12H2 M22 12H20" transform="rotate(45 12 12)" />
    </g>
</svg>
`,o=`<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <line x1="8" y1="21" x2="16" y2="21" />
    </g>
</svg>`,s=t({defaultClassName:`_1t6cds04 _1t6cds03 jr2hcpf jr2hcp1c jr2hcpbs jr2hcpb8`,variantClassNames:{ready:{false:`_1t6cds05`,true:`_1t6cds06`}},defaultVariants:{ready:!1},compoundVariants:[]}),c=t({defaultClassName:`_1t6cds08 _1t6cds07 jr2hcpbs jr2hcpbe`,variantClassNames:{activeTheme:{light:`_1t6cds09`,system:`_1t6cds0a`,dark:`_1t6cds0b`},ready:{false:`_1t6cds0c`,true:`_1t6cds0d`},animate:{false:`_1t6cds0e`,true:`_1t6cds0f`}},defaultVariants:{activeTheme:`system`,ready:!1,animate:!1},compoundVariants:[[{ready:!0,animate:!0},`_1t6cds0g`]]}),l=t({defaultClassName:`_1t6cds0i _1t6cds0h jr2hcpc jr2hcp1c jr2hcpx jr2hcpbs`,variantClassNames:{selected:{false:`_1t6cds0j`,true:`_1t6cds0k`}},defaultVariants:{selected:!1},compoundVariants:[]}),u=t({defaultClassName:`_1t6cds0m _1t6cds0l jr2hcpc jr2hcp1c jr2hcpx jr2hcpaf`,variantClassNames:{active:{false:`_1t6cds0n`,true:`_1t6cds0o`}},defaultVariants:{active:!1},compoundVariants:[]}),d=n(),f=[{value:`light`,label:`Light`,icon:a},{value:`system`,label:`System`,icon:o},{value:`dark`,label:`Dark`,icon:i}],p=e=>e===`light`||e===`dark`||e===`system`,m=()=>({activeTheme:`system`,ready:!1}),h=()=>{let e=document.documentElement.dataset.themePreference;return p(e)?e:window.__theme?.get()??`system`};function g(){let[{activeTheme:e,ready:t},n]=(0,r.useState)(m),[i,a]=(0,r.useState)(!1),o=()=>{n({activeTheme:h(),ready:!0})},p=e=>{window.__theme?.set(e),n({activeTheme:e,ready:!0}),a(!0)};return(0,r.useEffect)(()=>(o(),document.addEventListener(`astro:before-preparation`,o),()=>{document.removeEventListener(`astro:before-preparation`,o)}),[]),(0,d.jsxs)(`div`,{className:s({ready:t}),role:`group`,"aria-label":`Color Theme`,children:[(0,d.jsx)(`span`,{className:c({activeTheme:e,ready:t,animate:i}),"aria-hidden":`true`,"data-theme-indicator":`true`}),f.map(t=>(0,d.jsx)(`button`,{type:`button`,className:l({selected:e===t.value}),"aria-pressed":e===t.value,"aria-label":`Set ${t.label} theme`,title:t.label,"data-theme-value":t.value,onClick:()=>{p(t.value)},children:(0,d.jsx)(`span`,{className:u({active:e===t.value}),"aria-hidden":`true`,"data-theme-value":t.value,dangerouslySetInnerHTML:{__html:t.icon}})},t.value))]})}export{g as default};
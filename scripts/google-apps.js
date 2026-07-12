/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// ------------------------Google App Menu-----------------------------------

// ---- App Registry: all Google apps with SVG icons ----
const GOOGLE_APPS_REGISTRY = [
    {
        id: "account",
        name: "Account",
        url: "https://myaccount.google.com/",
        shortLabel: "Account",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4c-4.42 0-8 3.58-8 8 0 1.95.7 3.73 1.86 5.12a9.95 9.95 0 0 1 12.28 0A7.96 7.96 0 0 0 20 12c0-4.42-3.58-8-8-8m0 9c-1.93 0-3.5-1.57-3.5-3.5S10.07 6 12 6s3.5 1.57 3.5 3.5S13.93 13 12 13" opacity=".3"/><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-1.74 0-3.34-.56-4.65-1.5C8.66 17.56 10.26 17 12 17s3.34.56 4.65 1.5c-1.31.94-2.91 1.5-4.65 1.5m6.14-2.88a9.95 9.95 0 0 0-12.28 0A7.96 7.96 0 0 1 4 12c0-4.42 3.58-8 8-8s8 3.58 8 8c0 1.95-.7 3.73-1.86 5.12"/><path fill="currentColor" d="M12 5.93c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5m0 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5"/></svg>`
    },
    {
        id: "search",
        name: "Search",
        url: "https://google.com/",
        shortLabel: "Search",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><path fill="currentColor" d="M32.582 370.734C15.127 336.291 5.12 297.425 5.12 256c0-41.426 10.007-80.291 27.462-114.735C74.705 57.484 161.047 0 261.12 0c69.12 0 126.836 25.367 171.287 66.793l-73.31 73.309c-26.763-25.135-60.276-38.168-97.977-38.168-66.56 0-123.113 44.917-143.36 105.426-5.12 15.36-8.146 31.65-8.146 48.64 0 16.989 3.026 33.28 8.146 48.64l-.303.232h.303c20.247 60.51 76.8 105.426 143.36 105.426 34.443 0 63.534-9.31 86.341-24.67 27.23-18.152 45.382-45.148 51.433-77.032H261.12v-99.142h241.105c3.025 16.757 4.654 34.211 4.654 52.364 0 77.963-27.927 143.592-76.334 188.276-42.356 39.098-100.305 61.905-169.425 61.905-100.073 0-186.415-57.483-228.538-141.032z"/></svg>`
    },
    {
        id: "youtube",
        name: "YouTube",
        url: "https://www.youtube.com/",
        shortLabel: "YouTube",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="47" height="47" viewBox="1 0 24 24"><path fill="currentColor" d="M12 4c.855 0 1.732.022 2.582.058l1.004.048.961.057.9.061.822.064a3.8 3.8 0 0 1 3.494 3.423l.04.425.075.91c.07.943.122 1.971.122 2.954s-.052 2.011-.122 2.954l-.075.91-.04.425a3.8 3.8 0 0 1-3.495 3.423l-.82.063-.9.062-.962.057-1.004.048A62 62 0 0 1 12 20a62 62 0 0 1-2.582-.058l-1.004-.048-.961-.057-.9-.062-.822-.063a3.8 3.8 0 0 1-3.494-3.423l-.04-.425-.075-.91A41 41 0 0 1 2 12c0-.983.052-2.011.122-2.954l.075-.91.04-.425A3.8 3.8 0 0 1 5.73 4.288l.821-.064.9-.061.962-.057 1.004-.048A62 62 0 0 1 12 4m-2 5.575v4.85c0 .462.5.75.9.52l4.2-2.425a.6.6 0 0 0 0-1.04l-4.2-2.424a.6.6 0 0 0-.9.52Z" fill-rule="evenodd"/></svg>`
    },
    {
        id: "gmail",
        name: "Gmail",
        url: "https://mail.google.com/",
        shortLabel: "Gmail",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24"><path fill="currentColor" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457"/></svg>`
    },
    {
        id: "ytmusic",
        name: "YouTube Music",
        url: "https://music.youtube.com/",
        shortLabel: "YTMusic",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 24 24"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M8.217 8.286C9.265 7.254 10.514 6.743 12 6.743s2.735.51 3.783 1.543s1.562 2.258 1.562 3.714s-.514 2.68-1.562 3.713s-2.297 1.543-3.783 1.543s-2.735-.51-3.783-1.543S6.655 13.455 6.655 12s.514-2.682 1.562-3.714m6.977 3.715L10 14.91V9.088z"/><path d="M19.071 18.966Q22.001 16.08 22 12q0-4.081-2.929-6.967Q16.141 2.147 12 2.147T4.929 5.033T2 12q0 4.08 2.929 6.966q2.93 2.886 7.071 2.886q4.142 0 7.071-2.886M12 5.433c-1.827 0-3.407.644-4.702 1.92C6.002 8.63 5.345 10.19 5.345 12c0 1.809.657 3.37 1.953 4.646c1.295 1.276 2.874 1.92 4.702 1.92s3.407-.644 4.702-1.92c1.296-1.276 1.953-2.837 1.953-4.646c0-1.81-.657-3.37-1.953-4.647c-1.295-1.276-2.875-1.92-4.702-1.92"/></g></svg>`
    },
    {
        id: "maps",
        name: "Maps",
        url: "https://maps.google.com/",
        shortLabel: "Maps",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><path fill="currentColor" d="M96 8c38.11 0 69 30.89 69 69 0 14.15-4.26 27.31-11.57 38.26-14.46 21.66-37.07 37.94-48.72 61.23l-1.54 3.07c-1.48 2.96-4.33 4.44-7.18 4.44s-5.69-1.48-7.17-4.44l-1.54-3.07c-11.65-23.29-34.25-39.57-48.71-61.23C31.26 104.31 27 91.15 27 77 27 38.89 57.89 8 96 8m0 31.99c-20.43 0-37 16.57-37 37s16.56 37 37 37 37-16.57 37-37-16.57-37-37-37"/></svg>`
    },
    {
        id: "play",
        name: "Google Play",
        url: "https://play.google.com/",
        shortLabel: "Play",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 16 16"><path fill="currentColor" d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96zm-3.595 2.116L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055zM1 13.396V2.603L6.846 8zM1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27"/></svg>`
    },
    {
        id: "drive",
        name: "Drive",
        url: "https://drive.google.com/",
        shortLabel: "Drive",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192" fill="currentColor"><mask id="a" width="168" height="154" x="12" y="18" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path d="M63.09 37c14.6-25.3 51.193-25.3 65.8 0l45.033 78c14.62 25.334-3.6 57.001-32.91 57.001H50.967c-29.2 0-47.536-31.667-32.91-57"/></mask><g mask="url(#a)"><path d="M211.905 172.02h-91.888l-19.015-32.934 45.944-79.5m-166.865 112.42L45.04 59.494v.002L26.032 92.422h38.02L110 172"/><path d="M96.007-25.085 141.954 54.5l-19.011 32.928H3"/></g></svg>`
    },
    {
        id: "photos",
        name: "Photos",
        url: "https://photos.google.com/",
        shortLabel: "Photos",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 256 256"><g fill="currentColor"><path d="M192 88a63.7 63.7 0 0 1-14 40h-50V24a64 64 0 0 1 64 64M64 168a64 64 0 0 0 64 64V128H78a63.7 63.7 0 0 0-14 40" opacity=".2"/><path d="M232 120h-39.51A72 72 0 0 0 128 16a8 8 0 0 0-8 8v39.51A72 72 0 0 0 16 128a8 8 0 0 0 8 8h39.51A72 72 0 0 0 128 240a8 8 0 0 0 8-8v-39.51A72 72 0 0 0 240 128a8 8 0 0 0-8-8M120 223.43A56.09 56.09 0 0 1 72 168a55.3 55.3 0 0 1 10-32h38ZM120 120H32.57A56.09 56.09 0 0 1 88 72a55.3 55.3 0 0 1 32 10Zm16-87.43A56.09 56.09 0 0 1 184 88a55.3 55.3 0 0 1-10 32h-38ZM168 184a55.3 55.3 0 0 1-32-10v-38h87.43A56.09 56.09 0 0 1 168 184"/></g></svg>`
    },
    {
        id: "translate",
        name: "Translate",
        url: "https://translate.google.com/",
        shortLabel: "Translate",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="currentColor" d="m12 22-1-3H4q-.825 0-1.412-.587T2 17V4q0-.825.588-1.412T4 2h6l.875 3H20q.875 0 1.438.563T22 7v13q0 .825-.562 1.413T20 22zm-4.85-7.4q1.725 0 2.838-1.112T11.1 10.6q0-.2-.012-.362t-.063-.338h-3.95v1.55H9.3q-.2.7-.763 1.088t-1.362.387q-.975 0-1.675-.7T4.8 10.5t.7-1.725 1.675-.7q.45 0 .85.163t.725.487L9.975 7.55Q9.45 7 8.712 6.7T7.15 6.4q-1.675 0-2.863 1.188T3.1 10.5t1.188 2.913T7.15 14.6m6.7.5.55-.525q-.35-.425-.637-.825t-.563-.85zm1.25-1.275q.7-.825 1.063-1.575t.487-1.175h-3.975l.3 1.05h1q.2.375.475.813t.65.887M13 21h7q.45 0 .725-.288T21 20V7q0-.45-.275-.725T20 6h-8.825l1.175 4.05h1.975V9h1.025v1.05H19v1.025h-1.275q-.25.95-.75 1.85T15.8 14.6l2.725 2.675L17.8 18l-2.7-2.7-.9.925L15 19z"/></svg>`
    },
    {
        id: "calendar",
        name: "Calendar",
        url: "https://calendar.google.com/",
        shortLabel: "Calendar",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"><path fill="currentColor" d="M18.316 5.684H24v12.632h-5.684zM5.684 24h12.632v-5.684H5.684zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684zm-7.207 6.25v-.065q.407-.216.687-.617c.28-.401.279-.595.279-.982q0-.568-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.7 2.7 0 0 0-1.197-.257q-.9 0-1.481.467-.579.467-.793 1.078l1.085.452q.13-.374.413-.633.284-.258.767-.257.495 0 .816.264a.86.86 0 0 1 .322.703q0 .495-.36.778t-.886.284h-.567v1.085h.633q.611 0 1.02.327.407.327.407.843 0 .505-.387.832c-.387.327-.565.327-.924.327q-.527 0-.897-.311-.372-.312-.521-.881l-1.096.452q.268.923.977 1.401.707.479 1.538.477a2.84 2.84 0 0 0 1.293-.291q.574-.29.902-.794.327-.505.327-1.149 0-.643-.344-1.105a2.07 2.07 0 0 0-.881-.689m2.093-1.931.602.913L15 10.045v5.744h1.187V8.446h-.827zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0m-3.289 23.5 4.684-4.684h-4.684zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0z"/></svg>`
    },
    {
        id: "meet",
        name: "Meet",
        url: "https://meet.google.com/",
        shortLabel: "Meet",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><path fill="currentColor" d="M110.015 108.88c-6.829-4.718-6.921-14.778-.179-19.62L165 49.643c7.94-5.701 19-.038 19 9.737v77.755c0 9.675-10.861 15.359-18.821 9.859z"/><path fill="currentColor" d="M8 71c0-24.3 19.7-44 44-44h64c11.046 0 20 8.954 20 20v98c0 11.046-8.954 20-20 20H28c-11.046 0-20-8.954-20-20z"/><circle cx="38" cy="135" r="14" fill="#fff"/></svg>`
    },
    {
        id: "chat",
        name: "Chat",
        url: "https://chat.google.com/",
        shortLabel: "Chat",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192" fill="none"><rect width="160" height="96" x="16" y="28" fill="currentColor" rx="48" opacity=".5"/><path fill="currentColor" d="M133 48c28.167 0 51 22.834 51 51 0 28.167-22.833 51-51 51H96.624l-34.857 23.064c-3.86 2.544-5.789 3.816-7.372 3.92a6 6 0 0 1-5.612-3.022C48 172.583 48 170.271 48 165.649V148.81C25.121 143.78 8 123.39 8 99c0-28.166 22.834-51 51-51z"/><path stroke="#fff" stroke-linecap="round" stroke-width="12" d="M62 94s8.84 18 34 18 34-17.182 34-17.182"/></svg>`
    },
    {
        id: "news",
        name: "News",
        url: "https://news.google.com/",
        shortLabel: "News",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="currentColor" d="M21.267 21.2a.614.614 0 0 1-.613.613H3.344a.614.614 0 0 1-.612-.613V8.115a.614.614 0 0 1 .613-.613h17.309a.614.614 0 0 1 .613.613zm-3.032-3.42v-1.195a.08.08 0 0 0-.08-.08h-5.373v1.361h5.373a.08.08 0 0 0 .08-.083zm.817-2.587v-1.201a.08.08 0 0 0-.079-.082h-6.19v1.362h6.189a.08.08 0 0 0 .08-.078v-.004zm-.817-2.588V11.4a.08.08 0 0 0-.08-.08h-5.373v1.361h5.373a.08.08 0 0 0 .08-.079zM8.15 14.045v1.226h1.77c-.145.748-.804 1.292-1.77 1.292a1.976 1.976 0 0 1 0-3.95 1.77 1.77 0 0 1 1.253.49l.934-.932a3.14 3.14 0 0 0-2.187-.853 3.268 3.268 0 1 0 0 6.537c1.89 0 3.133-1.328 3.133-3.197a4 4 0 0 0-.052-.619zM2.27 7.654a.616.616 0 0 1 .613-.613h12.154l-1.269-3.49a.595.595 0 0 0-.743-.383L.368 7.775a.594.594 0 0 0-.323.775l2.225 6.112za.616.616 0 0 1 .613-.613h12.154l-1.269-3.49a.595.595 0 0 0-.743-.383L.368 7.775a.594.594 0 0 0-.323.775l2.225 6.112zm21.312-.31-8.803-2.37.751 2.067h5.584a.614.614 0 0 1 .613.613v8.794l2.247-8.365a.59.59 0 0 0-.392-.74m-4.496-1.675V2.795a.61.61 0 0 0-.611-.608H5.524a.61.61 0 0 0-.616.605v2.837l8.39-3.052a.594.594 0 0 1 .743.39l.544 1.497z"/></svg>`
    },
    {
        id: "contacts",
        name: "Contacts",
        url: "https://contacts.google.com/",
        shortLabel: "Contacts",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 512 512"><path fill="currentColor" d="M203.5 249.4c-90.7 0-164.1 73.4-164.1 164.1v68.9c0 16.3 13.2 29.5 29.5 29.5h78.8l78.8-262.6h-23z" opacity=".4"/><path fill="currentColor" d="M472.6 357.7c0-59.9-48.4-108.3-108.3-108.3h-78.8V512h78.8c59.9 0 108.3-48.4 108.3-108.3" opacity=".6"/><path fill="currentColor" d="M118.2 357.7c0-59.9 48.4-108.3 108.3-108.3h59.1c59.9 0 108.3 48.4 108.3 108.3v45.9c0 59.9-48.4 108.3-108.3 108.3H147.7c-16.3 0-29.5-13.2-29.5-29.5zM256 0c56.2 0 101.7 45.6 101.7 101.7S312.2 203.5 256 203.5s-101.7-45.6-101.7-101.7S199.8 0 256 0"/></svg>`
    },
    {
        id: "myadcenter",
        name: "My Ad Center",
        url: "https://myadcenter.google.com/",
        shortLabel: "My Ad Ce...",
        fullLabel: "My Ad<br>Center",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><g fill="currentColor"><circle cx="96.5" cy="29.5" r="21.5"/><path d="M129 115H63.5C49.42 115 38 103.58 38 89.5S49.42 64 63.5 64H129z" opacity=".6"/><circle cx="128.5" cy="89.5" r="25.5"/><path d="M156.3 184H36v-56h120.3c15.3 0 27.7 12.4 27.7 27.7v.6c0 15.3-12.4 27.7-27.7 27.7" opacity=".6"/><circle cx="36" cy="156" r="28"/></g></svg>`
    },
    {
        id: "business",
        name: "Business Profile",
        url: "https://business.google.com/",
        shortLabel: "Business ...",
        fullLabel: "Business<br>Profile",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="currentColor" d="M22 8.5c0 1.37-1.12 2.5-2.5 2.5S17 9.87 17 8.5c0 1.37-1.12 2.5-2.5 2.5S12 9.87 12 8.5c0 1.37-1.12 2.5-2.5 2.5S7 9.87 7 8.5C7 9.87 5.88 11 4.5 11S2 9.87 2 8.5l1.39-5.42S3.68 2 4.7 2h14.6c1.02 0 1.31 1.08 1.31 1.08zm-1 3.7V20c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-7.8a3.96 3.96 0 0 0 4-.58c.69.55 1.56.88 2.5.88.95 0 1.82-.33 2.5-.88.69.55 1.56.88 2.5.88.95 0 1.82-.33 2.5-.88.68.55 1.56.88 2.5.88.53 0 1.04-.11 1.5-.3m-2 5.13c0-.2 0-.41-.05-.63l-.03-.16h-2.97v1.17h1.81c-.06.22-.14.44-.31.62-.33.33-.78.51-1.26.51-.5 0-.99-.21-1.35-.56-.69-.71-.69-1.86.02-2.58.69-.7 1.83-.7 2.55-.03l.14.13.84-.85-.16-.14c-.56-.52-1.3-.81-2.08-.81h-.01c-.81 0-1.57.31-2.14.87-.59.58-.92 1.34-.92 2.13 0 .8.31 1.54.88 2.09a3.2 3.2 0 0 0 2.22.91h.02c.8 0 1.51-.29 2.03-.8.47-.48.77-1.2.77-1.87"/></svg>`
    },
    {
        id: "shopping",
        name: "Shopping",
        url: "https://google.com/shopping/",
        shortLabel: "Shopping",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 512 512"><path fill="currentColor" fill-rule="evenodd" d="M495.5 11.6C486.9 4.1 475.9 0 464.5 0H298.1c-12.6 0-24.6 4.9-33.5 13.8L152.3 126l44 44.2c18.9-18 44.2-29 72.1-29 25.9.1 50.8 9.8 69.8 27.4l.4.4-24.7 25h-.1l-6.3 6.5c-10.8-9.3-24.7-14.4-39-14.4-34.1 1.3-61.6 28.6-62.7 62.7-1.2 35.9 26.9 65.9 62.7 67.1 29.4 0 51.5-15.5 56.8-42.4h-56.8v-42.4h98.8c1.5 6.6 2.3 13.2 2.4 19.7 0 29.1-8.4 53-22 71-19 25.1-48.3 38.6-79.2 38.6-33.1 0-62.6-15.5-82-39.9-15-18.9-24-43.2-24-69.7 0-31.9 13-60.6 33.9-80.6l-44-44.2L14 264.3c-9 8.9-14 21.1-14 33.8-.1 12.6 5 24.7 14 33.5l80.8 80.8 85.6 85.6c8.9 8.9 20.9 14 33.5 14 12.7-.1 24.8-5.1 33.8-14l138.1-138.2.1.1 112-112.1c9-8.8 14.1-20.9 14-33.5V47.7c.1-13.9-5.9-27-16.4-36.1M446 112.9c-5.3 14.5-19.1 24.3-34.6 24.2-11.1 0-21.3-4.7-28.2-13.3-12-14.5-11-35.8 2.4-49.1s34.7-14.3 49.2-2.4c12 9.8 16.5 26.1 11.2 40.6"/></svg>`
    },
    // --- Below separator (non-favorite defaults) ---
    {
        id: "docs",
        name: "Docs",
        url: "https://docs.google.com/document/",
        shortLabel: "Docs",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" fill="none"><rect width="192" height="192" fill="transparent" pointer-events="all"/><path d="M130.334 184H61.6c-8.943 0-13.415 0-16.962-1.404a20 20 0 0 1-11.233-11.234C32 167.815 32 163.343 32 154.4V37.6c0-8.943 0-13.415 1.405-16.962A20 20 0 0 1 44.638 9.404C48.185 8 52.657 8 61.6 8H100l54.793 54.793c1.661 1.661 2.492 2.492 3.13 3.43a12 12 0 0 1 1.862 4.502c.212 1.115.212 2.301.21 4.674-.035 48.918-.057 49.4-.058 78.967 0 8.966 0 13.45-1.405 16.997a20 20 0 0 1-11.233 11.233C143.752 184 139.279 184 130.334 184" fill="currentColor"/><rect width="64" height="12" rx="6" ry="6" transform="translate(64.001 114)" fill="#fff"/><rect width="48" height="12" rx="6" ry="6" transform="translate(64.001 143)" fill="#fff"/><path d="M154.995 62.995A14.93 14.93 0 0 0 146 60h-33.2c-7.069 0-12.8-5.73-12.8-12.8V8z" fill="#fff" opacity=".35"/></svg>`
    },
    {
        id: "sheets",
        name: "Sheets",
        url: "https://docs.google.com/spreadsheets/",
        shortLabel: "Sheets",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect x="8.231" y="105.367" width="471" height="276.538" rx="52" fill="currentColor" opacity=".5"/><rect x="52" y="70" width="436" height="348" rx="50" fill="currentColor"/><rect x="362" y="173.385" width="33" height="207" rx="16" fill="#fff"/><rect x="302.231" y="181" width="33" height="262" rx="16" fill="#fff" transform="rotate(-90 318.731 312)"/></svg>`
    },
    {
        id: "slides",
        name: "Slides",
        url: "https://docs.google.com/presentation/",
        shortLabel: "Slides",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="none" viewBox="0 0 192 192"><path fill="currentColor" d="M12.591 63.318c-2.493-15.262 7.858-29.655 23.12-32.148l96.724-15.8c15.262-2.492 29.655 7.859 32.148 23.12l14.732 90.189c2.493 15.262-7.858 29.655-23.12 32.148l-96.724 15.8c-15.262 2.493-29.655-7.858-32.148-23.12z" opacity=".5"/><path fill="currentColor" d="M12 61.6c0-8.943 0-13.415 1.405-16.962a20 20 0 0 1 11.233-11.233C28.185 32 32.656 32 41.6 32h108.8c8.943 0 13.415 0 16.962 1.404a20 20 0 0 1 11.234 11.234C180 48.185 180 52.657 180 61.6v68.8c0 8.943 0 13.415-1.404 16.962a20 20 0 0 1-11.234 11.234C163.815 160 159.343 160 150.4 160H41.6c-8.943 0-13.415 0-16.963-1.404a20 20 0 0 1-11.232-11.234C12 143.815 12 139.343 12 130.4z"/><path fill="#fff" fill-rule="evenodd" d="M148 58a6 6 0 0 1 6 6v64a6 6 0 0 1-6 6H44l-.309-.008A6 6 0 0 1 38 128V64a6 6 0 0 1 5.691-5.992L44 58zm-98 64h92V70H50z" clip-rule="evenodd"/></svg>`
    },
    {
        id: "forms",
        name: "Forms",
        url: "https://docs.google.com/forms/",
        shortLabel: "Forms",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192" fill="none"><rect width="102" height="50" x="70" y="121" fill="currentColor" opacity=".5" rx="25"/><rect width="50" height="50" x="20" y="121" fill="currentColor" opacity=".5" rx="25"/><rect width="50" height="50" x="20" y="71" fill="currentColor" rx="25"/><rect width="102" height="50" x="70" y="71" fill="currentColor" rx="25"/><rect width="102" height="50" x="70" y="21" fill="currentColor" opacity=".8" rx="25"/><rect width="50" height="50" x="20" y="21" fill="currentColor" opacity=".8" rx="25"/><path stroke="#fff" stroke-linecap="round" stroke-width="12" d="M95 46h52"/><circle cx="45" cy="46" r="12" fill="#fff"/></svg>`
    },
    {
        id: "keep",
        name: "Keep",
        url: "https://keep.google.com/",
        shortLabel: "Keep",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192" fill="none"><circle cx="96" cy="78" r="70" fill="currentColor" opacity=".8"/><path fill="#fff" d="M78 127c0-7.18 5.82-13 13-13h10c7.18 0 13 5.82 13 13s-5.82 13-13 13H91c-7.18 0-13-5.82-13-13"/><path fill="currentColor" d="M64 140h64v13c0 17.673-14.327 33-32 33s-32-15.327-32-33z"/></svg>`
    },
    {
        id: "finance",
        name: "Finance",
        url: "https://google.com/finance/",
        shortLabel: "Finance",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 86.016 86.016"><g fill="currentColor" fill-rule="evenodd"><path d="m0 79.053 20.89-18.022 22.118 6.553 43.008-31.949v47.104a3.276 3.276 0 0 1-3.277 3.277H3.277A3.28 3.28 0 0 1 0 82.738z"/><path d="m0 65.946 20.48-22.938 23.445 4.982L86.016 4.506v78.233a3.276 3.276 0 0 1-3.277 3.277H3.277A3.28 3.28 0 0 1 0 82.738z" opacity=".6"/><path d="M0 56.934h86.016V82.74a3.276 3.276 0 0 1-3.277 3.276H3.277A3.277 3.277 0 0 1 0 82.74zm0-27.853h86.016v27.853H0zM0 3.276A3.276 3.276 0 0 1 3.277 0H82.74a3.276 3.276 0 0 1 3.276 3.276v25.806H0z" opacity=".5"/></g></svg>`
    },
    {
        id: "googleads",
        name: "Google Ads",
        url: "https://ads.google.com/",
        shortLabel: "Google Ads",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 48 48"><defs><mask id="ipTGoogleAds0"><g fill="none" stroke="#fff" stroke-width="4"><path fill="#555" d="M41.355 34.153L29.522 8.776a6 6 0 0 0-10.876 5.072L30.48 39.224a6 6 0 1 0 10.876-5.071Z"/><path stroke-linecap="round" d="M23.438 26.536L17.52 39.224a6 6 0 0 1-7.974 2.902v0a6 6 0 0 1-2.902-7.973L18.374 9"/><circle cx="12.083" cy="36.688" r="6" fill="#555" transform="rotate(25 12.083 36.688)"/></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipTGoogleAds0)"/></svg>`
    },
    {
        id: "analytics",
        name: "Google Analytics",
        url: "https://analytics.google.com/",
        shortLabel: "Google A...",
        fullLabel: "Google<br>Analytics",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"><path fill="currentColor" d="M22.84 2.998v17.999a2.983 2.983 0 0 1-2.967 2.998 3 3 0 0 1-.368-.02 3.06 3.06 0 0 1-2.61-3.1V3.12A3.06 3.06 0 0 1 19.51.02a2.983 2.983 0 0 1 3.329 2.978zM4.133 18.055a2.973 2.973 0 1 0 0 5.945 2.973 2.973 0 0 0 0-5.945m7.872-9.01h-.05a3.06 3.06 0 0 0-2.892 3.126v7.985c0 2.167.954 3.482 2.35 3.763a2.978 2.978 0 0 0 3.57-2.927v-8.959a2.983 2.983 0 0 0-2.978-2.988"/></svg>`
    },
    {
        id: "passwords",
        name: "Password Manager",
        url: "https://passwords.google.com/",
        shortLabel: "Password ...",
        fullLabel: "Password<br>Manager",
        svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M11.657 13.999A6.01 6.01 0 0 1 6.001 18C2.691 18 0 15.31 0 12s2.693-6 6.001-6a6.01 6.01 0 0 1 5.657 4.005H7.857a2.7 2.7 0 0 0-1.856-.732A2.73 2.73 0 0 0 3.273 12a2.73 2.73 0 0 0 2.728 2.727 2.7 2.7 0 0 0 1.852-.729zm.489-3.634h4.948v3.274h-4.948a6.3 6.3 0 0 0 0-3.273m-.373 3.274H8.182v-.008c.732-.985.717-2.3 0-3.258v-.007h3.59a5.97 5.97 0 0 1 0 3.273m12.227.36v2.912h-2.181V15.82a1.092 1.092 0 1 0-2.183 0v1.091h-2.182V14Zm-6.546-3.634H24v3.274h-6.546z"/></svg>`
    },
    {
        id: "googleone",
        name: "Google One",
        url: "https://one.google.com/",
        shortLabel: "Google O...",
        fullLabel: "Google<br>One",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="43" height="43" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M11 5v13.982a2 2 0 0 0 4 0V5a2 2 0 1 0-4 0"/><path d="M6.63 8.407a2.125 2.125 0 0 0-.074 2.944c.77.834 2.051.869 2.862.077l4.95-4.834c.812-.792.846-2.11.076-2.945a1.984 1.984 0 0 0-2.861-.077z"/></g></svg>`
    },
    {
        id: "travel",
        name: "Travel",
        url: "https://google.com/travel/",
        shortLabel: "Travel",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"><g transform="translate(-10.26 -2.766)"><path d="M79.343 20.404a7.18 7.18 0 0 1 7.178-7.178h38.758a7.18 7.18 0 0 1 7.178 7.178v38.758a7.177 7.177 0 0 1-7.178 7.194H86.521a7.177 7.177 0 0 1-7.178-7.194zm12.92 5.032v26.919h26.914V25.436zM78.805 180.82a13.457 13.457 0 1 1 13.458-13.457c0 7.432-6.025 13.457-13.458 13.457m53.83 0a13.457 13.457 0 1 1 13.457-13.457c0 7.432-6.025 13.457-13.457 13.457" fill="currentColor" fill-rule="evenodd" opacity=".8"/><rect width="319.72" height="370.83" rx="39.15" ry="39.15" transform="matrix(.33 0 0 .33 53.506 61.931)" fill="currentColor"/><path d="M136.264 117.299a35.3 35.3 0 0 1 .604 6.517c0 17.735-11.88 30.344-29.852 30.344a31.043 31.043 0 1 1 0-62.083c8.395 0 15.41 3.082 20.79 8.088l-8.768 8.752v-.027c-3.264-3.105-7.402-4.695-12.029-4.695-10.263 0-18.599 8.652-18.599 18.899s8.336 18.915 18.6 18.915c9.308 0 15.644-5.316 16.948-12.61h-16.946v-12.1z" fill="#fff"/></g></svg>`
    },
    {
        id: "classroom",
        name: "Classroom",
        url: "https://classroom.google.com/",
        shortLabel: "Classroom",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"><path fill="currentColor" d="M1.637 1.637C.732 1.637 0 2.369 0 3.273v17.454c0 .904.732 1.636 1.637 1.636h20.726c.905 0 1.637-.732 1.637-1.636V3.273c0-.904-.732-1.636-1.637-1.636zm.545 2.181h19.636v16.364h-2.726v-1.09h-4.91v1.09h-12zM12 8.182a1.636 1.636 0 1 0 0 3.273 1.636 1.636 0 1 0 0-3.273m-4.363 1.91c-.678 0-1.229.55-1.229 1.226a1.228 1.228 0 0 0 2.455 0c0-.677-.549-1.226-1.226-1.226m8.726 0a1.227 1.227 0 1 0 0 2.453 1.227 1.227 0 0 0 0-2.453M12 12.545c-1.179 0-2.413.401-3.148 1.006a4.1 4.1 0 0 0-1.215-.188c-1.314 0-2.729.695-2.729 1.559v.896h14.184v-.896c0-.864-1.415-1.559-2.729-1.559-.41 0-.83.068-1.215.188-.735-.605-1.969-1.006-3.148-1.006"/></svg>`
    },
    {
        id: "books",
        name: "Books",
        url: "https://books.google.com/",
        shortLabel: "Books",
        fullLabel: null,
        svg: `<svg height="50" viewBox="0 0 32 32" width="50" xmlns="http://www.w3.org/2000/svg"><path d="M791.497 1598.394v10.5c0 .831-.67 1.5-1.5 1.5h-16c-.831 0-1.5-.669-1.5-1.5v-22c0-.83.669-1.5 1.5-1.5h16c.83 0 1.5.67 1.5 1.5v8z" style="fill:currentColor;opacity:.8;stroke:none;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4.0999999;stroke-dasharray:none" transform="translate(-766.497 -1582.394)"/><path d="M785.497 1590.394h-5v-2h5m0 6h-4v-2h4" style="fill:currentColor;fill-opacity:1;stroke:none;stroke-width:1;stroke-linecap:round;stroke-linejoin:round" transform="translate(-766.497 -1582.394)"/><path d="M773.997 1585.394c-.831 0-1.5.67-1.5 1.5v22c0 .831.669 1.5 1.5 1.5h2.5v-25z" style="opacity:1;fill:currentColor;fill-opacity:1;stroke:none;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4.0999999;stroke-dasharray:none" transform="translate(-766.497 -1582.394)"/><path d="M785.497 1585.394h3v11l-1.5-1-1.5 1z" style="fill:#fff;fill-opacity:1;stroke:none;stroke-width:.99999994;stroke-linecap:round;stroke-linejoin:round" transform="translate(-766.497 -1582.394)"/></svg>`
    },
    {
        id: "blogger",
        name: "Blogger",
        url: "https://blogger.com/",
        shortLabel: "Blogger",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 640 640"><path fill="currentColor" d="M598.661 239.979h-35.882c-21.97 0-41.245-18.603-42.757-40.004 0-114.167-92.044-200.01-207.003-200.01H208.124C93.237-.035.07 92.493-.012 206.649v226.774c0 114.167 93.25 206.613 208.136 206.613h224c114.957 0 207.887-92.446 207.887-206.613V286.94c0-22.808-18.401-46.938-41.374-46.938l.023-.024zm-398.674-79.997H320c21.992 0 40.004 18.012 40.004 40.004 0 21.993-18.012 40.005-40.004 40.005l-120.013-.012c-21.992 0-40.004-18.012-40.004-40.004 0-22.005 18.012-40.005 40.004-40.005zm240.027 320H199.987c-21.992 0-40.004-18-40.004-40.004 0-21.993 18.012-40.005 40.004-40.005l240.027.024c21.992 0 40.004 18 40.004 40.004 0 21.993-18.012 40.005-40.004 40.005z"/></svg>`
    },
    {
        id: "earth",
        name: "Earth",
        url: "https://earth.google.com/",
        shortLabel: "Earth",
        fullLabel: null,
        svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 0c-1.326 0-2.597.22-3.787.613 4.94-1.243 8.575 1.72 11.096 5.606 1.725 2.695 2.813 2.83 4.207 2.412A11.956 11.956 0 0 0 12 0M7.658 2.156c-1.644.019-3.295.775-4.931 2.207A11.97 11.97 0 0 0 0 12c.184-2.823 2.163-5.128 4.87-5.07 2.104.044 4.648 1.518 7.13 5.289 4.87 7.468 10.917 5.483 11.863 1.51.081-.566.137-1.14.137-1.729 0-.176-.02-.347-.027-.521-1.645 1.725-4.899 2.35-8.264-2.97-2.59-4.363-5.31-6.383-8.05-6.353zM3.33 13.236c-1.675.13-2.657 1.804-2.242 3.756A11.96 11.96 0 0 0 12 24c4.215 0 7.898-2.149 10.037-5.412v-.043c-2.836 3.49-8.946 4.255-13.855-2.182-1.814-2.386-3.544-3.228-4.852-3.127"/></svg>`
    },
    {
        id: "artsandculture",
        name: "Arts and Culture",
        url: "https://artsandculture.google.com/",
        shortLabel: "Arts and ...",
        fullLabel: "Arts and<br>Culture",
        svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><path d="M386.83 280.519h-68.824c.557 15.644.82 8.77.557 15.644-1.66 43.141-34.43 75.075-77.511 75.139v43.733c57.126-.119 107.377-33.778 117.373-89.481h28.404z" fill="currentColor" opacity=".8" fill-rule="nonzero"/><path d="m241.052 371.302-.119.002c-43.136 0-78.104-34.968-78.104-78.104s34.968-78.103 78.104-78.103l.119.002v-43.736h-.119c-67.288 0-121.837 54.55-121.837 121.837s54.55 121.837 121.837 121.837h.119z" fill="currentColor" fill-rule="nonzero"/><path d="M241.17 83.067c-48.765 0-88.296 39.53-88.296 88.296v.119h44.563c0-24.088 19.527-43.615 43.615-43.615 24.087 0 43.614 19.527 43.614 43.615s-19.527 43.615-43.614 43.615v44.563h.118c48.766 0 88.296-39.531 88.296-88.297s-39.53-88.296-88.296-88.296m91.14 332.089h63.764L241.052 259.66h-63.763z" fill="currentColor" fill-rule="nonzero"/></svg>`
    },
    {
        id: "saved",
        name: "Saved",
        url: "https://google.com/save/",
        shortLabel: "Saved",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"><path d="m130.56 172.798-46.04-19.184c-1.681.602-3.782 1.55-5.456 2.249l-10.072 4.197-30.596 12.758-.002-91.974-.003-33.326c-.001-5.467-.006-10.932-.008-16.407-.021-3.314 1.125-6.353 3.529-8.68 3.205-3.102 6.283-3.226 10.409-3.223l5.856.009 19.72.002h39.492c7.673-.004 15.548-.098 23.196.03 1.553-.052 2.754-.04 4.347.31-7.05-1.75-14.36 3.634-14.337 11.326" fill="currentColor"/><path d="M140.585 19.25c1.553-.053 2.806-.096 4.347.308 5.22 1.37 8.693 5.945 8.66 11.327-.018 3.123.01 6.264.007 9.378V57.46l-.002 63.748-.001 20.783c0 3.813-.055 7.798.021 11.601-2.726-1.067-5.512-2.285-8.23-3.412L130.561 144l-.009-76.047.001-25.43-.007-8.116c0-1.348-.06-3.269.05-4.569-.067-2.195.85-4.003 2.017-5.683 1.93-2.779 4.688-4.303 7.972-4.905" fill="currentColor" opacity=".8"/><path d="M82.409 69.22c6.784-.735 13.537 1.913 18.35 6.662l-5.43 5.418c-1.902-1.779-3.76-2.994-6.261-3.796a15.44 15.44 0 0 0-11.813 1.115 15.3 15.3 0 0 0-7.413 8.922c-1.218 3.96-.909 8.105 1.05 11.778a15.4 15.4 0 0 0 9.216 7.569 15.42 15.42 0 0 0 11.789-1.281c3.827-2.11 6.257-5.437 7.447-9.594-4.728-.134-10.067-.01-14.844-.008-.045-1.796-.12-5.895.007-7.584.247-.134.368-.092.676-.098l22.03.02c.783 6.767-.304 12.535-4.63 18.053a23 23 0 0 1-15.41 8.645 23.14 23.14 0 0 1-17.116-4.906 23.16 23.16 0 0 1-8.478-15.376 23.12 23.12 0 0 1 4.914-16.994c4.064-5.045 9.523-7.85 15.916-8.545" fill="#fff"/></svg>`
    },
    {
        id: "chromewebstore",
        name: "Chrome Web Store",
        url: "https://chromewebstore.google.com/",
        shortLabel: "Chrome ...",
        fullLabel: "Chrome<br>Web Store",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24"><path fill="currentColor" d="M0 1.637v19.09c0 .9.736 1.636 1.636 1.636h.131a10.4 10.4 0 0 1-.13-1.636 10.3 10.3 0 0 1 1.667-5.64l4.202 7.276h1.128A3.77 3.77 0 0 1 12 16.958a3.77 3.77 0 0 1 3.366 5.406h1.048a4.7 4.7 0 0 0-1.587-5.406h6.83a10.34 10.34 0 0 1 .577 5.406h.13c.9 0 1.636-.737 1.636-1.637V1.637Zm9.273 2.181h5.454a1.09 1.09 0 1 1 0 2.182H9.273a1.09 1.09 0 1 1 0-2.182M12 10.364a10.36 10.36 0 0 1 9.233 5.652H12a4.71 4.71 0 0 0-4.677 4.149L3.91 14.25A10.34 10.34 0 0 1 12 10.364"/></svg>`
    },
    // --- 7 New Apps ---
    {
        id: "vids",
        name: "Vids",
        url: "https://docs.google.com/videos/create",
        shortLabel: "Vids",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="currentColor" viewBox="0 0 192 192"><path d="M47 135c-6.509 0-9.763 0-12.44-.683a22 22 0 0 1-15.877-15.876C18 115.763 18 112.509 18 106V86c0-6.509 0-9.763.683-12.44A22 22 0 0 1 34.56 57.682C37.237 57 40.491 57 47 57s9.763 0 12.44.683A22 22 0 0 1 75.318 73.56C76 76.237 76 79.491 76 86v20c0 6.509 0 9.763-.683 12.441a22 22 0 0 1-15.876 15.876C56.763 135 53.509 135 47 135" opacity=".3"/><path d="M60 156c-14.36 0-26-11.641-26-26V62c0-14.36 11.64-26 26-26h48c14.359 0 26 11.64 26 26v68c0 14.359-11.641 26-26 26z" opacity=".5"/><rect width="152" height="106" x="54" y="172" rx="32" transform="rotate(-90 54 172)"/><path fill="#fff" d="M120.644 88.198c4.03 2.19 6.044 3.285 6.881 4.625a6 6 0 0 1 0 6.354c-.837 1.34-2.851 2.435-6.881 4.625l-18.524 10.067c-3.727 2.026-5.591 3.039-7.112 3.041a6 6 0 0 1-5.284-3.142C89 112.431 89 110.31 89 106.067V85.933c0-4.243 0-6.364.724-7.701a6 6 0 0 1 5.284-3.142c1.52.002 3.385 1.015 7.112 3.04z"/></svg>`
    },
    {
        id: "merchantcenter",
        name: "Merchant Center",
        url: "https://merchants.google.com/",
        shortLabel: "Merchant ...",
        fullLabel: "Merchant<br>Center",
        svg: `<svg height="250" width="250" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0.02 0.02 40.98 40.96"><defs><path id="b" d="M13.75 20.1a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1m16.536 4.763-9.36-9.36a2.07 2.07 0 0 0-1.466-.603h-7.28a2.073 2.073 0 0 0-2.08 2.08v7.28c0 .572.229 1.092.614 1.466l9.35 9.36c.384.375.904.614 1.476.614s1.092-.239 1.466-.614l7.28-7.28c.385-.374.614-.894.614-1.466 0-.582-.239-1.102-.614-1.477"/></defs><g fill="none" fill-rule="evenodd"><path d="M.02 9.833h40.96v27.734a3.413 3.413 0 0 1-3.413 3.413H3.433A3.414 3.414 0 0 1 .02 37.567z" fill="currentColor"/><path d="m14.471 29.421 10.637-9.726L41 35.563l-.007 2.004a3.43 3.43 0 0 1-3.426 3.413H26.081z" fill="url(#a)"/><path d="M.02 3.433A3.413 3.413 0 0 1 3.433.02h34.134a3.413 3.413 0 0 1 3.413 3.413v6.4H.02z" fill="currentColor" opacity=".8"/><path d="M18.793 4.713h-4.054a1.493 1.493 0 0 0 0 2.986H26.26a1.493 1.493 0 0 0 0-2.986h-4.054v-.427a1.707 1.707 0 1 0-3.414 0z" fill="#fff"/><use fill="#fff" xlink:href="#b"/></g></svg>`
    },
    {
        id: "wallet",
        name: "Wallet",
        url: "https://wallet.google.com/",
        shortLabel: "Wallet",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"><g clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" fill="currentColor"><path d="M172.5 76.767V51.265c0-14.725-10.92-26.726-24.318-26.726H43.827c-13.406.134-24.325 12.135-24.325 26.726v25.501c0 2.59 1.864 52.81 4.22 52.81h144.563c2.357 0 4.215-50.22 4.215-52.81z" opacity=".25"/><path d="M172.5 99.135V73.768c0-14.732-10.92-26.733-24.318-26.733H43.827c-13.406 0-24.325 12-24.325 26.733v25.501c0 2.59 1.864 22.37 4.22 22.37h144.563c2.357-.142 4.215-19.913 4.215-22.504" opacity=".45"/><path d="M172.5 121.638V96c0-14.732-10.134-26.596-23.532-26.596H44.613c-13.405 0-24.325 12.001-24.325 26.733v25.501c0 2.59 1.078 19.09 3.435 19.09h144.562c2.357-.134 4.215-16.64 4.215-19.09" opacity=".65"/><path d="M116.787 109.363 19.502 84.544v56.183c0 14.732 10.92 26.733 24.324 26.733h104.356c13.398 0 24.318-12 24.318-26.733V83.453L149.296 102c-9.427 7.497-21.218 10.227-32.51 7.363z"/></g></svg>`
    },
    {
        id: "notebooklm",
        name: "NotebookLM",
        url: "https://notebooklm.google.com/",
        shortLabel: "Notebook...",
        fullLabel: "Notebook<br>LM",
        svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><path fill="currentColor" d="M255.979 66.987C114.603 66.987 0 183.21 0 326.657v124.33h47.19v-12.373c0-58.198 46.463-105.345 103.807-105.345s103.808 47.147 103.808 105.323v12.395h47.19v-12.373c0-84.63-67.627-153.174-150.998-153.174a148.64 148.64 0 0 0-87.168 28.117C89.6 261.59 142.656 225.92 203.947 225.92c86.55 0 156.736 71.21 156.736 158.998v66.069h47.19v-66.07c0-114.24-91.308-206.89-203.948-206.89a201.46 201.46 0 0 0-132.629 49.75c35.03-67.18 104.576-112.94 184.704-112.94 115.328 0 208.81 94.848 208.81 211.84v124.31H512v-124.33C511.98 183.21 397.376 66.986 255.98 66.986z"/></svg>`
    },
    {
        id: "tasks",
        name: "Tasks",
        url: "https://tasks.google.com/",
        shortLabel: "Tasks",
        fullLabel: null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="none" viewBox="0 0 192 192"><rect width="152" height="130" x="20" y="52" fill="currentColor" rx="65" opacity=".5"/><rect width="172" height="152" x="10" y="14" fill="currentColor" rx="74"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="12" d="m61 90 22.172 22.172a4 4 0 0 0 5.656 0L138 63"/></svg>`
    },
    {
        id: "scholar",
        name: "Scholar",
        url: "https://scholar.google.com/",
        shortLabel: "Scholar",
        fullLabel: null,
        svg: `<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" width="42" height="42"><path fill="currentColor" d="M9.174 24.096 0 16.625 21 0l21 16.625-9.174 7.471c-2.117-4.41-6.614-7.471-11.826-7.471-5.21 0-9.709 3.059-11.826 7.471M21 17.5A12.25 12.25 0 1 0 21 42a12.25 12.25 0 0 0 0-24.5"/></svg>`
    },
    {
        id: "labs",
        name: "Google Labs",
        url: "https://labs.google/",
        shortLabel: "Labs",
        fullLabel: null,
        svg: `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 96 96"><path fill="currentColor" d="M33.719 13.608c-.911 1.009-.887 2.231.049 3.24.503.527.866.674 1.969.719l1.344.073.073 6.936c.073 9.6.192 9.265-5.352 17.664C21.699 57.576 20.76 58.993 14.979 67.8c-1.679 2.569-2.088 3.913-1.993 6.409.073 1.56.241 2.28.744 3.313.841 1.704 2.807 3.697 4.632 4.632l1.442.768 27.48.073c31.01.073 29.208.192 31.778-1.728 2.712-2.039 3.983-4.465 3.983-7.561-.024-2.304-.552-3.554-3.432-7.945-1.442-2.185-3.791-5.809-5.257-8.04-1.463-2.255-3.337-5.111-4.151-6.36s-2.447-3.746-3.599-5.519-2.999-4.584-4.081-6.242c-3.767-5.687-3.721-5.519-3.721-14.808v-7.271h1.344c1.201 0 1.417-.073 2.161-.817.527-.527.817-1.058.817-1.463s-.29-.936-.817-1.463l-.817-.817H34.344zM54.022 25.68c.073 4.416.265 8.424.384 8.881.817 2.904 2.039 5.041 7.896 13.8.984 1.442 1.777 2.88 1.777 3.17 0 1.079-1.609 1.993-3.554 1.993-2.018 0-7.177 1.463-10.103 2.831-.744.36-2.688 1.368-4.343 2.255-7.439 3.959-11.16 5.016-15.241 4.248-1.655-.311-2.615-.744-3.554-1.609-1.058-1.009-.887-1.752 1.128-4.873 2.639-4.081 7.415-11.447 9.624-14.857 3.791-5.833 3.959-6.528 3.959-16.32 0-4.056.073-7.439.168-7.537.098-.073 2.761-.119 5.928-.098l5.784.073z"/></svg>`
    }
];

// Default first 18 apps are favorites (matching the original above-separator apps)
const DEFAULT_FAVORITE_IDS = GOOGLE_APPS_REGISTRY.slice(0, 18).map(app => app.id);

// ---- State Management ----
function loadGoogleAppsState() {
    let favoriteIds = null;
    let hiddenIds = [];

    try {
        const storedFavorites = localStorage.getItem("googleAppsFavorites");
        if (storedFavorites) {
            favoriteIds = JSON.parse(storedFavorites);
        }
    } catch (e) { /* use default */ }

    try {
        const storedHidden = localStorage.getItem("googleAppsHidden");
        if (storedHidden) {
            hiddenIds = JSON.parse(storedHidden);
        }
    } catch (e) { /* use default */ }

    // Use defaults if nothing stored
    if (!favoriteIds) {
        favoriteIds = [...DEFAULT_FAVORITE_IDS];
    }

    return { favoriteIds, hiddenIds };
}

function saveGoogleAppsState(favoriteIds, hiddenIds) {
    localStorage.setItem("googleAppsFavorites", JSON.stringify(favoriteIds));
    localStorage.setItem("googleAppsHidden", JSON.stringify(hiddenIds));
}

// ---- Rendering ----
const iconContainer = document.getElementById("iconContainer");
const googleAppsCont = document.getElementById("googleAppsCont");
let isEditMode = false;
let { favoriteIds, hiddenIds } = loadGoogleAppsState();
let dragSrcEl = null;

function getAppById(id) {
    return GOOGLE_APPS_REGISTRY.find(app => app.id === id);
}

function createAppElement(app, isFavorite) {
    const isHidden = hiddenIds.includes(app.id);
    const el = document.createElement("a");
    el.href = app.url;
    el.className = "icon-item";
    el.dataset.appId = app.id;
    if (isHidden) {
        el.classList.add("hidden-app");
    }

    // Build the inner content
    let labelHtml = "";
    if (app.fullLabel) {
        const hasShortOne = app.shortLabel.includes("...");
        labelHtml = `<div class="label short${hasShortOne ? " one" : ""}">${app.shortLabel}</div><div class="label full">${app.fullLabel}</div>`;
    } else {
        labelHtml = `<div class="label short">${app.shortLabel}</div>`;
    }

    el.innerHTML = `
        <div class="menuicon">${app.svg}</div>
        ${labelHtml}
    `;

    // Edit mode overlays
    if (isEditMode) {
        el.classList.add("editing");
        el.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        if (isFavorite) {
            // Remove from favorites button
            const removeBtn = document.createElement("button");
            removeBtn.className = "gapps-remove-btn";
            removeBtn.title = "Remove from favorites";
            removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13H5v-2h14z"/></svg>`;
            removeBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                favoriteIds = favoriteIds.filter(id => id !== app.id);
                saveGoogleAppsState(favoriteIds, hiddenIds);
                renderApps();
            });
            el.appendChild(removeBtn);

            // Drag handle
            el.setAttribute("draggable", "true");
            el.addEventListener("dragstart", handleDragStart);
            el.addEventListener("dragover", handleDragOver);
            el.addEventListener("dragenter", handleDragEnter);
            el.addEventListener("dragleave", handleDragLeave);
            el.addEventListener("drop", handleDrop);
            el.addEventListener("dragend", handleDragEnd);
        } else {
            // Add to favorites button
            const addBtn = document.createElement("button");
            addBtn.className = "gapps-add-btn";
            addBtn.title = "Add to favorites";
            addBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>`;
            addBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                favoriteIds.push(app.id);
                saveGoogleAppsState(favoriteIds, hiddenIds);
                renderApps();
            });
            el.appendChild(addBtn);

            // Hide/Show toggle
            const hideBtn = document.createElement("button");
            hideBtn.className = "gapps-hide-btn";
            hideBtn.title = isHidden ? "Show app" : "Hide app";
            hideBtn.innerHTML = isHidden
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"/></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46A11.8 11.8 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3z"/></svg>`;
            hideBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (isHidden) {
                    hiddenIds = hiddenIds.filter(id => id !== app.id);
                } else {
                    hiddenIds.push(app.id);
                }
                saveGoogleAppsState(favoriteIds, hiddenIds);
                renderApps();
            });
            el.appendChild(hideBtn);
        }
    }

    return el;
}

function renderApps() {
    const favGrid = document.getElementById("gappsFavoritesGrid");
    const othersGrid = document.getElementById("gappsOthersGrid");

    if (!favGrid || !othersGrid) return;

    favGrid.innerHTML = "";
    othersGrid.innerHTML = "";

    // Render favorites
    favoriteIds.forEach(id => {
        const app = getAppById(id);
        if (app && !hiddenIds.includes(id)) {
            favGrid.appendChild(createAppElement(app, true));
        }
    });

    // Render others (not favorited)
    GOOGLE_APPS_REGISTRY.forEach(app => {
        if (!favoriteIds.includes(app.id)) {
            const el = createAppElement(app, false);
            // In non-edit mode, hidden apps are not shown at all
            if (!isEditMode && hiddenIds.includes(app.id)) return;
            othersGrid.appendChild(el);
        }
    });

    // Update edit button icon
    const editBtn = document.getElementById("gappsEditBtn");
    if (editBtn) {
        if (isEditMode) {
            editBtn.classList.add("active");
            editBtn.title = "Done editing";
        } else {
            editBtn.classList.remove("active");
            editBtn.title = "Edit favorites";
        }
    }

    // Toggle edit class on the container
    if (isEditMode) {
        iconContainer.classList.add("edit-mode");
    } else {
        iconContainer.classList.remove("edit-mode");
    }
}

// ---- Drag and Drop Handlers (Favorites only) ----
function handleDragStart(e) {
    dragSrcEl = this;
    this.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", this.dataset.appId);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add("drag-over");
}

function handleDragLeave() {
    this.classList.remove("drag-over");
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    this.classList.remove("drag-over");

    if (dragSrcEl !== this) {
        const fromId = dragSrcEl.dataset.appId;
        const toId = this.dataset.appId;
        const fromIdx = favoriteIds.indexOf(fromId);
        const toIdx = favoriteIds.indexOf(toId);

        if (fromIdx > -1 && toIdx > -1) {
            // Remove from old position and insert at new position
            favoriteIds.splice(fromIdx, 1);
            favoriteIds.splice(toIdx, 0, fromId);
            saveGoogleAppsState(favoriteIds, hiddenIds);
            renderApps();
        }
    }
}

function handleDragEnd() {
    this.classList.remove("dragging");
    // Clean up all drag-over states
    const items = document.querySelectorAll("#gappsFavoritesGrid .icon-item");
    items.forEach(item => item.classList.remove("drag-over"));
}

// ---- Edit Mode Toggle ----
function toggleEditMode() {
    isEditMode = !isEditMode;
    renderApps();
}

// ---- Menu Toggle ----
googleAppsCont.addEventListener("click", function (event) {
    const isMenuVisible = iconContainer.style.display === "grid";

    // Toggle menu visibility
    iconContainer.style.display = isMenuVisible ? "none" : "grid";

    // Add or remove the class to hide the tooltip
    if (!isMenuVisible) {
        iconContainer.style.animation = "panelScaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards";
        googleAppsCont.classList.add("menu-open"); // Hide tooltip
        // Exit edit mode when reopening
        if (isEditMode) {
            isEditMode = false;
        }
        renderApps();
    } else {
        // Exit edit mode when closing
        if (isEditMode) {
            isEditMode = false;
            renderApps();
        }
        googleAppsCont.classList.remove("menu-open"); // Restore tooltip
    }

    event.stopPropagation();
});

// Close menu when clicking outside
document.addEventListener("click", function (event) {
    const isClickInside =
        iconContainer.contains(event.target) || googleAppsCont.contains(event.target);

    if (!isClickInside && iconContainer.style.display === "grid") {
        iconContainer.style.display = "none"; // Hide menu
        googleAppsCont.classList.remove("menu-open"); // Restore tooltip
        if (isEditMode) {
            isEditMode = false;
            renderApps();
        }
    }
});

// ---- Initial Render ----
renderApps();

// ---- Edit button listener (set up after DOM ready) ----
document.addEventListener("DOMContentLoaded", function () {
    const editBtn = document.getElementById("gappsEditBtn");
    if (editBtn) {
        editBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            toggleEditMode();
        });
    }
});

// ------------------------End of Google App Menu Setup-----------------------------------

// Save and load toggle state
document.addEventListener("DOMContentLoaded", function () {
    const googleAppsCont = document.getElementById("googleAppsCont");
    const googleAppsCheckbox = document.getElementById("googleAppsCheckbox");

    googleAppsCheckbox.addEventListener("change", function () {
        saveCheckboxState("googleAppsCheckboxState", googleAppsCheckbox);
        if (googleAppsCheckbox.checked) {
            googleAppsCont.style.display = "flex";
            saveDisplayStatus("googleAppsDisplayStatus", "flex");
        } else {
            googleAppsCont.style.display = "none";
            saveDisplayStatus("googleAppsDisplayStatus", "none");
        }
    });
    loadCheckboxState("googleAppsCheckboxState", googleAppsCheckbox);
    loadDisplayStatus("googleAppsDisplayStatus", googleAppsCont);
});
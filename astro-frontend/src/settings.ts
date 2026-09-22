const cog = document.getElementById("cog");

cog.addEventListener("click", () => {
    let sidebar = document.getElementById("settingsSidebar");
    let current_z_index = sidebar.style.zIndex;

    if (current_z_index == "-1") {
        sidebar.style.zIndex = "1";
    } else {
        sidebar.style.zIndex = "-1";
    }

})

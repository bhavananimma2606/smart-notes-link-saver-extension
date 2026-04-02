document.addEventListener("DOMContentLoaded", () => {

  const status = document.getElementById("status");
  const notes = document.getElementById("notes");
  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");

  const linkInput = document.getElementById("linkInput");
  const addLinkBtn = document.getElementById("addLinkBtn");
  const linksList = document.getElementById("linksList");
  const saveTabBtn = document.getElementById("saveTabBtn");
  
  const searchInput=document.getElementById("searchInput");
  // ================= NOTES =================

  // Load saved notes
  chrome.storage.local.get(["userNotes"], (result) => {
    if (result.userNotes) {
      notes.value = result.userNotes;
    }
  });

  // Save notes
  saveBtn.addEventListener("click", () => {
    chrome.storage.local.set({ userNotes: notes.value }, () => {
      status.textContent = "Saved Notes!";
      setTimeout(() => status.textContent = "", 2000);
    });
  });

  // Clear notes
  clearBtn.addEventListener("click", () => {
    chrome.storage.local.clear(() => {
      notes.value = "";
      status.textContent = "Cleared!";
      setTimeout(() => status.textContent = "", 2000);
    });
  });

  // ================= LOAD LINKS =================

  chrome.storage.local.get(["myLinks"], (result) => {
    const links = result.myLinks || [];
    links.forEach((link, i) => addLinkToUI(link, i));
  });

  // ================= ADD LINK =================

  addLinkBtn.addEventListener("click", () => {
    const link = linkInput.value.trim();

    // Validation
    if (!link) {
      status.textContent = "Enter a link!";
      return;
    }

    if (!link.startsWith("http")) {
      status.textContent = "Invalid link!";
      return;
    }

    chrome.storage.local.get(["myLinks"], (result) => {
      const links = result.myLinks || [];

      // Prevent duplicates
      if (links.includes(link)) {
        status.textContent = "Already saved!";
        return;
      }

      links.push(link);

      chrome.storage.local.set({ myLinks: links }, () => {
        addLinkToUI(link, links.length - 1);
        linkInput.value = "";

        status.textContent = "Link added ";
        setTimeout(() => status.textContent = "", 2000);
      });
    });
  });

  // ================= SAVE CURRENT TAB =================

  saveTabBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentLink = tabs[0].url;

      chrome.storage.local.get(["myLinks"], (result) => {
        const links = result.myLinks || [];

        if (links.includes(currentLink)) {
          status.textContent = "Already saved!";
          return;
        }

        links.push(currentLink);

        chrome.storage.local.set({ myLinks: links }, () => {
          addLinkToUI(currentLink, links.length - 1);

          status.textContent = "Tab saved ";
          setTimeout(() => status.textContent = "", 2000);
        });
      });
    });
  });

  //Search event listener
  searchInput.addEventListener("input",() => {
    const searchText=searchInput.value.toLowerCase();
    const items=linksList.querySelectorAll("li");
    items.forEach((li)=>{
      const linkText=li.textContent.toLowerCase();
      if(linkText.includes(searchText)){
        li.style.display="flex";
      }
      else{
        li.style.display="none";
      }
    });
  });

  // ================= SHOW LINK =================

  function addLinkToUI(link, index) {
    const li = document.createElement("li");

    const a = document.createElement("a");
    a.href = link;
    a.textContent = link;
    a.target = "_blank";

    const delBtn = document.createElement("button");
    delBtn.textContent = "Remove";

    delBtn.addEventListener("click", () => {
      deleteLink(index);
    });

    li.appendChild(a);
    li.appendChild(delBtn);
    linksList.appendChild(li);
  }

  // ================= DELETE LINK =================

  function deleteLink(index) {
    chrome.storage.local.get(["myLinks"], (result) => {
      let links = result.myLinks || [];

      links.splice(index, 1);

      chrome.storage.local.set({ myLinks: links }, () => {
        linksList.innerHTML = "";
        links.forEach((link, i) => addLinkToUI(link, i));
      });
    });
  }
});
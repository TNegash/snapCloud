document.addEventListener('DOMContentLoaded', function(){
    //window.onload = function() {
    const allHeadings = document.querySelectorAll(".learning-contents h2, .learning-contents h3, .learning-contents h4");
    const pageContent = document.querySelector(".learning-contents")
    
    
    if (allHeadings.length > 0) {
        generateTOC(allHeadings, pageContent );
    }
    //};
    });
    function  generateTOC(allHeadings, pageContent) {
        const tableOfContents = document.createElement("div");
        tableOfContents.classList.add("table-of-contents");
    
        const tocHeading = document.createElement("h2")
        tocHeading.classList.add("toc-heading");
        tocHeading.innerHTML = "Table of Contents";
    
        const headingsContainer = document.createElement("div")
        headingsContainer.classList.add("headings-container")
    
        const ul = document.createElement("ul");
        let subHeadingUl1 = null;
        let subHeadingUl2 = null;
    
        allHeadings.forEach(h => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = `#${h.id}`;
            a.innerHTML = h.innerHTML;
            li.appendChild(a);
            if (h.classList.contains("toc-h3")) {
                a.classList.add('sub-heading1');
                if (!subHeadingUl1) {
                    subHeadingUl1 = document.createElement("ul");
                    const previousLi1 = ul.lastChild;
                    previousLi1.appendChild(subHeadingUl1);
                }
                subHeadingUl1.appendChild(li);
                subHeadingUl2 = null;
            } else if (h.classList.contains("toc-h4")) {
                a.classList.add('sub-heading2');
                if (!subHeadingUl2) {
                    subHeadingUl2 = document.createElement("ul");
                    const previousLi2 = subHeadingUl1.lastChild;
                    previousLi2.appendChild(subHeadingUl2);
                }
                subHeadingUl2.appendChild(li);
            } else {
                a.classList.add("heading")
                ul.appendChild(li);
                subHeadingUl1 = null;
            }
    
        })
        headingsContainer.appendChild(ul);
        tableOfContents.appendChild(tocHeading);
        tableOfContents.appendChild(headingsContainer);
        pageContent.prepend(tableOfContents)
    };
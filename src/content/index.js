//import * as kuromoji from "kuromoji.js" - works?, file size too large? -ES6 only, last resort

window.storeOldNodes;
window.storeNewNodes;

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse) {
    if (request.action == "On") {
        // get all text nodes with kanji after wrapping them in span
        var textNodeList = textNodesUnder(document.documentElement);
        // wrap all kanji in text nodes in span
        for(var index = 0; index < textNodeList.length; index++) {
            wrapCharInSpan(textNodeList[index]);
        }
        // activates when kanji is clicked 
        document.addEventListener("click",function(event) {
            //targElem = reference to clicked char object (right?)
            var targElem = event.target;
            if(targElem.firstChild.nodeValue.search(/([一-龯])/) != -1) {
                var oldNewArr = kuromojiInitClick(targElem);
                storeOldNodes = oldNewArr[0];
                storeNewNodes = oldNewArr[1];
            } else {
                replaceTextNodes(storeNewNodes,storeOldNodes);
            }
        });
        sendResponse("On");
    } else if (request.action == "Off" && typeof storeOldNodes != "undefined" 
        && storeOldNodes != null && storeOldNodes.length > 0) {
        replaceTextNodes(storeNewNodes,storeOldNodes);
        sendResponse("Off and Undefined");
    } else {
        storeOldNodes = [];
        storeNewNodes = [];
        sendResponse("Else");
    }
});

function replaceTextNodes(txtArr1,txtArr2) {
    var currTextNode = txtArr1[index].parentNode;
    if (txtArr1.length >= txtArr2.length) {
        for(var index = 0; index < txtArr2.length; index++) {
            currTextNode.replaceChild(txtArr2[index],txtArr1[index]);
        }
        for(var index = txtArr2.length; index < txtArr1.length; index++) {
            currTextNode.removeChild(txtArr1[index]);
        }
    }
    if (txtArr2.length > txtArr1.length) {
        for(var index = 0; index < txtArr1.length; index++) {
            currTextNode.replaceChild(txtArr2[index],txtArr1[index]);
        }
        var elAfter = txtArr2[txtArr1.length - 1].nextSibling;
        for(var index = txtArr1.length; index < txtArr2.length; index++) {
            currTextNode.insertBefore(txtArr2[index],elAfter);
        }
    }
    storeOldNodes = [];
    storeNewNodes = [];
}

function kuromojiInitClick(targElem) {
    var kuromoji = require('kuromoji'); //- needs npm? -use npm and browserify to limit to client
    kuromoji.builder({dicPath: "kuromoji/dict/"}).build(function (err, tokenizer) {
        //tokenize elem into wakachigaki json array
        var jsonStr = tokenizer.tokenize(targElem.parentNode.textContent);
        //get length of element up until char clicked (not including)
        var prevLength = 0;
        var tempTarg = targElem;
        while (tempTarg = tempTarg.previousSibling) {
            prevLength += tempTarg.textContent.length;
        }
        //get index in jsonStr of word after clicked word
        var finalStrIndex = 0;
        while (jsonStr[index].word_position < prevLength + 1) {
            ++finalStrIndex;
        }
        //get reading of final word
        var finalReading = jsonStr[finalStrIndex-1].reading;
        //get length of final word
        var replaceLength = jsonStr[finalStrIndex].word_position -
                             jsonStr[finalStrIndex-1].word_position;
        //delete old reading
        var storeOldNodes = deleteOldReading(replaceLength,targElem);
        //add new reading
        var storeNewNodes = addNewReading(finalReading,targElem);
        
        return [storeOldNodes,storeNewNodes];        
    });
}

function addNewReading(finalReading,targElem) {
    var storeNewNodes = {};
    for (var addIndex = 0; addIndex < finalReading.length; addIndex++) {
        var insertedChr = document.createTextNode(finalReading.charAt(index));
        currTextNode.insertBefore(insertedChr,targElem);
        storeNewNodes.push(insertedChr);
    }  
    return storeNewNodes;
}

function deleteOldReading(replaceLength,targElem) {
    var targToDel = targElem;
    var storeOldNodes = {}; //for need to restore kanji to original state
    for (var replacePos = 0; replacePos < replaceLength; replacePos++) {
        targToDel = targToDel.nextSibling;
        storeOldNodes.push(targElem);
        currTextNode.removeChild(targElem);
        targElem = targToDel;
    }
    return storeOldNodes;
}

function wrapCharInSpan(textNode) {
    var text = textNode.nodeValue;
    var parent = textNode.parentNode;
    var chars = text.split(/([一-龯ぁ-ゔゞァ-・ヽヾ゛゜ー])/g);//splits on all ja char, including as separate char
    chars.forEach(function(oneChar) {
        var charNode = document.createTextNode(oneChar);
        if (/([一-龯])/.test(oneChar)) {
            var element = document.createElement("span");
            element.appendChild(charNode);
            parent.insertBefore(element,textNode);
        } else {
            parent.insertBefore(charNode,textNode);
        }
    });
    parent.removeChild(textNode);
}

//more efficient? limit to nodes w/ kanji
function textNodesUnder(el) {
    var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
    while(n=walk.nextNode()){
        if(n.nodeValue.search(/([一-龯])/) != -1) {
            var spanWrap = document.createElement("span");
            n.parentNode.insertBefore(spanWrap,n);
            n.parentNode.removeChild(n);
            spanWrap.appendChild(n);
            a.push(spanWrap.firstChild);
        }
    }
    return a; 
}

/*
//push old reading back on click
currTextNode.addEventListener("click", function(event) {
    if (storeNewNodes.indexof(event.target) != -1) {
        targElem = targElem.previousSibling;
        var prevTarg;
        for (var delIndex = 0; delIndex < finalReading.length; delIndex++) {
            prevTarg = targElem.previousSibling;
            currTextNode.removeChild(targElem);
            targElem = prevTarg;
        }
        targElem = targElem.nextSibling;
        for (var wbIndex = 0; wbIndex < replaceLength; wbIndex++) {
            currTextNode.insertBefore(storeOldNodes[index],targElem);
        }
    }
};
*/

/*
function getTextNodes(srcNode) {
    if(!srcNode.hasChildNodes()) {
        return
    }
    var childTextNodes = [];
    var childNodes = srcNode.childNodes;
    for (var index = 0; index < childNodes.length; index++) {
        if (childNodes[index].nodeType == Node.TEXT_NODE &&
                childNodes[index].textContent.search(([一-龯])) != -1) {
            childTextNodes.push(childNodes[index]);
        }
        else if (childNodes[index].nodeType == Node.ELEMENT_NODE) {
            Array.prototype.push.apply(childTextNodes, getTextNodes(childNodes[index]);
         }
     }
     return childTextNodes;
}
*/



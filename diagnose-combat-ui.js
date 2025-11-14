// Paste this into the browser console (F12) while on the Combat tab

console.log("=== COMBAT UI DIAGNOSIS ===");

// Check if combat view is active
const combatView = document.getElementById('view-combat');
if (!combatView) {
    console.error("❌ Combat view not found!");
} else {
    console.log("✅ Combat view found");
    const style = window.getComputedStyle(combatView);
    console.log("Combat view display:", style.display);
    console.log("Combat view pointer-events:", style.pointerEvents);
    console.log("Combat view z-index:", style.zIndex);
    console.log("Combat view position:", style.position);
}

// Check combat area
const combatArea = document.getElementById('combatArea');
if (!combatArea) {
    console.error("❌ Combat area not found!");
} else {
    console.log("✅ Combat area found");
    const style = window.getComputedStyle(combatArea);
    console.log("Combat area pointer-events:", style.pointerEvents);
    console.log("Combat area z-index:", style.zIndex);
}

// Check for enemy buttons
const enemyButtons = document.querySelectorAll('.enemy-button');
console.log(`Found ${enemyButtons.length} enemy buttons`);
if (enemyButtons.length > 0) {
    enemyButtons.forEach((btn, i) => {
        const style = window.getComputedStyle(btn);
        console.log(`Enemy button ${i}: pointer-events=${style.pointerEvents}, z-index=${style.zIndex}, display=${style.display}`);
    });
}

// Check for any elements with high z-index that might be blocking
console.log("\n=== CHECKING FOR BLOCKING ELEMENTS ===");
const allElements = document.querySelectorAll('*');
const highZIndex = [];
allElements.forEach(el => {
    const style = window.getComputedStyle(el);
    const zIndex = parseInt(style.zIndex);
    if (zIndex > 100 && style.display !== 'none') {
        highZIndex.push({
            element: el,
            zIndex: zIndex,
            pointerEvents: style.pointerEvents,
            position: style.position,
            tag: el.tagName,
            id: el.id,
            classes: el.className
        });
    }
});

if (highZIndex.length > 0) {
    console.log("⚠️ Found elements with high z-index:");
    highZIndex.sort((a, b) => b.zIndex - a.zIndex);
    highZIndex.forEach(item => {
        console.log(`  z-index: ${item.zIndex} | ${item.tag}#${item.id}.${item.classes} | pointer-events: ${item.pointerEvents} | position: ${item.position}`);
    });
} else {
    console.log("✅ No blocking high z-index elements found");
}

// Check what element is actually at the click position
console.log("\n=== CLICK POSITION TEST ===");
console.log("Move your mouse over the combat area and click...");

let clickTestEnabled = true;
document.addEventListener('click', function testClick(e) {
    if (!clickTestEnabled) return;

    const x = e.clientX;
    const y = e.clientY;
    const elementAtPoint = document.elementFromPoint(x, y);

    console.log(`\nClicked at (${x}, ${y})`);
    console.log("Element at click point:", elementAtPoint);
    console.log("Tag:", elementAtPoint.tagName);
    console.log("ID:", elementAtPoint.id);
    console.log("Classes:", elementAtPoint.className);

    const style = window.getComputedStyle(elementAtPoint);
    console.log("pointer-events:", style.pointerEvents);
    console.log("z-index:", style.zIndex);
    console.log("position:", style.position);

    // Show parent chain
    console.log("\nParent chain:");
    let parent = elementAtPoint.parentElement;
    let depth = 0;
    while (parent && depth < 10) {
        const pStyle = window.getComputedStyle(parent);
        console.log(`  ${depth}: ${parent.tagName}#${parent.id}.${parent.className} | pointer-events: ${pStyle.pointerEvents} | z-index: ${pStyle.zIndex}`);
        parent = parent.parentElement;
        depth++;
    }

    console.log("\n--- Click another element or type 'clickTestEnabled = false' to stop ---");
}, true);

console.log("\n=== DIAGNOSIS COMPLETE ===");
console.log("Now click on an enemy button or any combat UI element to see what's being clicked");

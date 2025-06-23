
  observer.observe(target, { childList: true, characterData: true, subtree: true });
const target = document.getElementById('pride');

const observer = new MutationObserver(() => {
  observer.disconnect(); // 🔴 Stop watching

  alert("I know you might not like pride month but I do, and you can be patient, it will be gone at the end of June.");
  target.textContent = '🏳️‍🌈 Happy Pride Month! 🏳️‍🌈';

  observer.observe(target, {  // 🟢 Start watching again
    childList: true,
    characterData: true,
    subtree: true
  });
});

observer.observe(target, {
  childList: true,
  characterData: true,
  subtree: true
});


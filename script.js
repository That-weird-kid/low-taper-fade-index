  const target = document.getElementById('pride');
  const observer = new MutationObserver(() => {
    alert("I know you might not like pride month but I do, and you can be patient, it will be gone at the end of June.");
    target.textContent = '🏳️‍🌈 Happy Pride Month! 🏳️‍🌈'
  });
  observer.observe(target, { childList: true, characterData: true, subtree: true });

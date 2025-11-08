function analyzeSkillGap(currentSkills = [], targetSkills = []) {
  const currentList = (currentSkills || []).map(s => String(s).toLowerCase());
  const currentSet = new Set(currentList);
  const targetList = (targetSkills || []).map(s => String(s).toLowerCase());
  const targetSet = new Set(targetList);

  const matched = targetList.filter(t => currentSet.has(t));
  const missing = targetList.filter(t => !currentSet.has(t));
  // Irrelevant: present in resume but not required by target path
  const irrelevant = currentList.filter(s => !targetSet.has(s));

  return {
    matched,
    missing,
    irrelevant,
    gapSize: missing.length,
  };
}

module.exports = { analyzeSkillGap };
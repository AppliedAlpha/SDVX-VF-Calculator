import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Table, ChevronDown, CheckCircle, Trophy, Sparkles, AlertCircle, Info, ChevronRight, TrendingUp, Medal, Target, X, Mail, Github, Twitter, User, Globe } from 'lucide-react';

const RANK_COEFF_TBL = [
  { threshold: 9900000, coeff: 1.05, label: "S" },
  { threshold: 9800000, coeff: 1.02, label: "AAA+" },
  { threshold: 9700000, coeff: 1.00, label: "AAA" },
  { threshold: 9500000, coeff: 0.97, label: "AA+" },
  { threshold: 9300000, coeff: 0.94, label: "AA" },
  { threshold: 9000000, coeff: 0.91, label: "A+" },
  { threshold: 8700000, coeff: 0.88, label: "A" },
  { threshold: 7500000, coeff: 0.85, label: "B" },
  { threshold: 6500000, coeff: 0.82, label: "C" },
  { threshold: 0, coeff: 0.80, label: "D" }
];

const GAUGE_COEFF_MAP = {
  'PUC': 1.10,
  'UC': 1.06,
  'MXV': 1.04,
  'EX': 1.02,
  'EF': 1.00
};

const calculateRawVF = (constant, score, mark) => {
  if (!constant || score === undefined || score === null || !mark) return 0;

  const rankData = RANK_COEFF_TBL.find(r => score >= r.threshold) || RANK_COEFF_TBL[RANK_COEFF_TBL.length - 1];
  const rankCoeff = rankData.coeff;
  const gaugeCoeff = GAUGE_COEFF_MAP[mark] || 1.0;

  return constant * 2 * (score / 10000000) * rankCoeff * gaugeCoeff;
};

const getDisplayVF = (rawVF) => Math.floor(rawVF * 10) / 10;

const calculateMinScore = (targetVF, level, mark) => {
  const gaugeCoeff = GAUGE_COEFF_MAP[mark];
  const isPUC = mark === 'PUC';

  if (isPUC) {
    const score = 10000000;
    const rankCoeff = 1.05;
    const rawVF = level * 2 * (score / 10000000) * rankCoeff * gaugeCoeff;
    const vf = Math.floor(rawVF * 10) / 10;
    return vf >= targetVF ? score : null;
  }

  let bestMinScore = null;

  for (let i = 0; i < RANK_COEFF_TBL.length; i++) {
    const { threshold: minScoreBoundary, coeff: rankCoeff } = RANK_COEFF_TBL[i];
    const maxScoreBoundary = i > 0 ? RANK_COEFF_TBL[i - 1].threshold - 1 : 9999999;

    const denominator = level * 2 * rankCoeff * gaugeCoeff;
    if (denominator === 0) continue;

    const requiredScoreRaw = (targetVF * 10000000) / denominator;
    let requiredScore = Math.ceil(requiredScoreRaw);

    if (requiredScore > 10000000) continue;

    const finalScore = Math.max(requiredScore, minScoreBoundary);

    if (finalScore > maxScoreBoundary) continue;

    const rawVF = level * 2 * (finalScore / 10000000) * rankCoeff * gaugeCoeff;
    const vf = Math.floor(rawVF * 10) / 10;

    if (vf >= targetVF) {
      if (bestMinScore === null || finalScore < bestMinScore) {
        bestMinScore = finalScore;
      }
    }
  }

  return bestMinScore;
};

const getGradeInfo = (vf) => {
  const floorVF = Math.floor(vf * 10) / 10;

  if (floorVF >= 46) return { name: 'IMPERIAL IV', style: 'text-purple-600 border-purple-600 bg-purple-500/20' };
  if (floorVF >= 44) return { name: 'IMPERIAL III', style: 'text-purple-500 border-purple-500 bg-purple-500/15' };
  if (floorVF >= 42) return { name: 'IMPERIAL II', style: 'text-purple-400 border-purple-400 bg-purple-500/10' };
  if (floorVF >= 40) return { name: 'IMPERIAL I', style: 'text-purple-300 border-purple-300 bg-purple-500/5' };

  if (floorVF >= 39.5) return { name: 'CRIMSON IV', style: 'text-red-400 border-red-400 bg-red-500/10' };
  if (floorVF >= 39.0) return { name: 'CRIMSON III', style: 'text-red-400 border-red-400 bg-red-500/10' };
  if (floorVF >= 38.5) return { name: 'CRIMSON II', style: 'text-red-400 border-red-400 bg-red-500/10' };
  if (floorVF >= 38.0) return { name: 'CRIMSON I', style: 'text-red-400 border-red-400 bg-red-500/10' };

  if (floorVF >= 37.5) return { name: 'ELDORA IV', style: 'text-yellow-400 border-yellow-400 bg-yellow-500/10' };
  if (floorVF >= 37.0) return { name: 'ELDORA III', style: 'text-yellow-400 border-yellow-400 bg-yellow-500/10' };
  if (floorVF >= 36.5) return { name: 'ELDORA II', style: 'text-yellow-400 border-yellow-400 bg-yellow-500/10' };
  if (floorVF >= 36.0) return { name: 'ELDORA I', style: 'text-yellow-400 border-yellow-400 bg-yellow-500/10' };

  return { name: 'VOLFORCE', style: 'text-slate-400 border-slate-600 bg-slate-800/50' };
};

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl overflow-hidden animate-scale-up">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg border-2 border-slate-700 overflow-hidden bg-slate-800">
            <img
              src="/profile.jpg"
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Info | @aria_applied</h2>
          <p className="text-xs text-slate-400 mb-6 px-4">
            피드백이나 오류 제보는 언제나 환영합니다!
          </p>

          <div className="w-full space-y-3">
            <a href="https://aria.applied.kr" target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all group">
              <div className="p-2 bg-black/30 rounded-lg text-white group-hover:text-cyan-400 transition-colors">
                <Globe size={18} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-slate-300">Web</span>
                <span className="text-[10px] text-slate-500">@AppliedAlpha</span>
              </div>
              <ChevronRight size={14} className="ml-auto text-slate-600 group-hover:text-slate-400" />
            </a>

            <a href="https://twitter.com/aria_applied" target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all group">
              <div className="p-2 bg-black/30 rounded-lg text-white group-hover:text-pink-400 transition-colors">
                <Twitter size={18} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-slate-300">X (Twitter)</span>
                <span className="text-[10px] text-slate-500">@aria_applied</span>
              </div>
              <ChevronRight size={14} className="ml-auto text-slate-600 group-hover:text-slate-400" />
            </a>

            <a href="mailto:aria@applied.kr" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all group">
              <div className="p-2 bg-black/30 rounded-lg text-white group-hover:text-purple-400 transition-colors">
                <Mail size={18} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-slate-300">Email</span>
                <span className="text-[10px] text-slate-500">aria@applied.kr</span>
              </div>
              <ChevronRight size={14} className="ml-auto text-slate-600 group-hover:text-slate-400" />
            </a>
          </div>

          <div className="mt-6 text-[10px] text-slate-600">
            © 2026 AppliedAlpha, SDVX VF Calculator. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

const BottomNav = ({ activeTab, setActiveTab }) => (
  <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex justify-around items-center z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
    <button
      onClick={() => setActiveTab('table')}
      className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${activeTab === 'table' ? 'text-cyan-400 scale-105' : 'text-slate-500 hover:text-slate-300'
        }`}
    >
      <Table size={22} strokeWidth={activeTab === 'table' ? 2.5 : 2} />
      <span className="text-[10px] mt-1 font-medium tracking-wide">볼포스 표</span>
    </button>
    <button
      onClick={() => setActiveTab('calculator')}
      className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${activeTab === 'calculator' ? 'text-pink-500 scale-105' : 'text-slate-500 hover:text-slate-300'
        }`}
    >
      <Calculator size={22} strokeWidth={activeTab === 'calculator' ? 2.5 : 2} />
      <span className="text-[10px] mt-1 font-medium tracking-wide">계산기</span>
    </button>
  </nav>
);

const VolforceTableView = ({ level, onLevelChange, constant, setConstant }) => {
  const availableConstants = useMemo(() => {
    if (level === 17) return [17.0, 17.5];
    return Array.from({ length: 10 }, (_, i) => (level + i * 0.1).toFixed(1));
  }, [level]);

  const tableRows = useMemo(() => {
    const maxPossibleVF = Number(constant) * 2 * 1.05 * 1.10;
    const minVF = Number(constant) * 2 * 0.97 * 1.00 * 0.95;

    let rawRows = [];
    for (let target = Math.floor(maxPossibleVF * 10) / 10; target >= Math.floor(minVF * 10) / 10; target -= 0.1) {
      const targetVF = Number(target.toFixed(1));

      const scoreEF = calculateMinScore(targetVF, Number(constant), 'EF');
      const scoreEX = calculateMinScore(targetVF, Number(constant), 'EX');
      const scoreMX = calculateMinScore(targetVF, Number(constant), 'MXV');

      let scoreUC_Column = calculateMinScore(targetVF, Number(constant), 'UC');
      if (!scoreUC_Column) {
        const scorePUC = calculateMinScore(targetVF, Number(constant), 'PUC');
        if (scorePUC) {
          scoreUC_Column = scorePUC;
        }
      }

      if (!scoreEF && !scoreEX && !scoreMX && !scoreUC_Column) continue;

      rawRows.push({
        vf: targetVF.toFixed(1),
        ef: scoreEF,
        ex: scoreEX,
        mx: scoreMX,
        uc: scoreUC_Column
      });
    }

    const marks = ['ef', 'ex', 'mx', 'uc'];
    const lastSeen = { ef: null, ex: null, mx: null, uc: null };

    for (let i = 0; i < rawRows.length; i++) {
      for (let m of marks) {
        const currentScore = rawRows[i][m];

        if (currentScore !== null) {
          if (currentScore === lastSeen[m]) {
            rawRows[i][m] = null;
          } else {
            lastSeen[m] = currentScore;
          }
        }
      }
    }

    return rawRows.filter(row =>
      row.ef !== null || row.ex !== null || row.mx !== null || row.uc !== null
    );

  }, [constant]);

  const formatScore = (num) => num ? num.toLocaleString() : '';

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white pt-6 px-4 pb-20 font-pretendard">
      <header className="mb-4 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            볼포스 표
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <label className="text-[10px] text-slate-500 font-bold block mb-0.5 ml-1">LEVEL</label>
          <div className="relative">
            <select
              value={level}
              onChange={(e) => onLevelChange(Number(e.target.value))}
              className="w-full bg-transparent text-base font-bold text-white appearance-none focus:outline-none"
            >
              {[17, 18, 19, 20].map((lv) => (
                <option key={lv} value={lv} className="bg-slate-900">Level {lv}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
          </div>
        </div>

        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <label className="text-[10px] text-slate-500 font-bold block mb-0.5 ml-1">CONSTANT</label>
          <div className="relative">
            <select
              value={constant}
              onChange={(e) => setConstant(Number(e.target.value))}
              className="w-full bg-transparent text-base font-bold text-cyan-400 appearance-none focus:outline-none"
            >
              {availableConstants.map((c) => (
                <option key={c} value={c} className="bg-slate-900">{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 text-[10px] text-slate-500 font-bold mb-2 px-2 text-center flex-shrink-0 uppercase tracking-wider">
        <div className="text-center">VF</div>
        <div>EF</div>
        <div>EX</div>
        <div>MXV</div>
        <div>UC/PUC</div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/30 scrollbar-hide relative">
        <div className="absolute inset-0 overflow-y-auto">
          {tableRows.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <Info size={24} className="mb-2 opacity-50" />
              <p className="text-xs">표시할 데이터가 없습니다</p>
            </div>
          ) : (
            tableRows.map((row, idx) => {
              const nextRow = tableRows[idx + 1];
              const isGap = nextRow && (Number(row.vf) - Number(nextRow.vf) > 0.15);
              const isPUCRow = row.uc === 10000000;

              return (
                <div
                  key={idx}
                  className={`grid grid-cols-5 text-[10px] sm:text-[11px] items-center text-center transition-colors px-1
                    ${isGap ? 'border-b-4 border-slate-700' : 'border-b border-slate-800/50'} 
                    ${isPUCRow
                      ? 'bg-yellow-500/20 hover:bg-yellow-500/30'
                      : (idx % 2 === 0 ? 'bg-slate-900/20 hover:bg-white/5' : 'bg-transparent hover:bg-white/5')
                    }
                    ${isPUCRow ? 'h-9' : 'py-2'} 
                  `}
                >
                  <div className="text-center font-bold text-cyan-300 font-mono text-xs">{row.vf}</div>

                  <div className="text-lime-400 font-mono tracking-tighter font-medium">{formatScore(row.ef)}</div>
                  <div className="text-orange-400 font-mono tracking-tighter font-medium">{formatScore(row.ex)}</div>
                  <div className="text-white font-mono tracking-tighter font-medium">{formatScore(row.mx)}</div>

                  <div className={`font-mono tracking-tighter font-bold 
                    ${row.uc === 10000000 ? 'text-yellow-300 font-black' : 'text-pink-400'}
                  `}>
                    {row.uc === 10000000 ? '10,000,000' : formatScore(row.uc)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const CalculatorView = ({
  levelInput, setLevelInput,
  scoreInput, setScoreInput,
  clearMark, setClearMark,
  result, setResult
}) => {
  const [error, setError] = useState('');

  const handleScoreChange = (e) => {
    const val = e.target.value;
    setScoreInput(val);

    const numericScore = parseInt(val.replace(/,/g, ''), 10);

    if (numericScore === 10000000) {
      setClearMark('PUC');
    }
    else if (clearMark === 'PUC' && numericScore !== 10000000) {
      setClearMark('UC');
    }
  };

  const handleScoreKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const currentVal = parseInt(scoreInput.replace(/,/g, ''), 10);
      if (isNaN(currentVal)) return;

      e.preventDefault();

      let newVal;
      const step = 10000;

      if (e.key === 'ArrowUp') {
        newVal = Math.floor(currentVal / step) * step + step;
        if (currentVal % step === 0) newVal = currentVal + step;
      } else {
        newVal = Math.ceil(currentVal / step) * step - step;
        if (currentVal % step === 0) newVal = currentVal - step;
      }

      if (newVal > 10000000) newVal = 10000000;
      if (newVal < 9000000) newVal = 9000000;

      setScoreInput(newVal.toString());

      if (newVal === 10000000) {
        setClearMark('PUC');
      } else if (clearMark === 'PUC' && newVal !== 10000000) {
        setClearMark('UC');
      }
    }
  };

  const handleMarkClick = (mark) => {
    const numericScore = parseInt(scoreInput.replace(/,/g, ''), 10);

    if (numericScore === 10000000 && mark !== 'PUC') {
      return;
    }

    setClearMark(mark);

    if (mark === 'PUC') {
      setScoreInput('10000000');
    }
  };

  const handleCalculate = () => {
    setError('');
    const lv = parseFloat(levelInput);
    const sc = parseInt(scoreInput.replace(/,/g, ''), 10);

    if (isNaN(lv) || lv < 17.0 || lv > 20.9) {
      setError('상수는 17.0 ~ 20.9 사이여야 합니다.');
      return;
    }
    if (lv >= 17.0 && lv < 18.0) {
      if (lv !== 17.0 && lv !== 17.5) {
        setError('17레벨은 17.0과 17.5만 존재합니다.');
        return;
      }
    }

    if (isNaN(sc) || sc < 0 || sc > 10000000) {
      setError('점수 범위를 확인해주세요.');
      return;
    }
    if (!clearMark) {
      setError('클리어 마크를 선택해주세요.');
      return;
    }

    const rawVF = calculateRawVF(lv, sc, clearMark);
    const displayVal = getDisplayVF(rawVF);

    let nextTargets = [];

    if (sc < 10000000) {
      const marks = ['EF', 'EX', 'MXV', 'UC', 'PUC'];
      const currentMarkIdx = marks.indexOf(clearMark);

      for (let i = currentMarkIdx + 1; i < marks.length; i++) {
        const nextMark = marks[i];

        let targetScore = sc;
        if (nextMark === 'PUC') targetScore = 10000000;

        const nextRaw = calculateRawVF(lv, targetScore, nextMark);
        const nextDisp = getDisplayVF(nextRaw);
        const diff = nextDisp - displayVal;

        if (diff > 0.0001) {
          nextTargets.push({
            type: 'mark',
            label: nextMark,
            subLabel: '달성',
            vf: nextDisp,
            gain: diff.toFixed(1)
          });
        }
      }

      const milestones = [
        { score: 9700000, label: '970만', rank: 'AAA' },
        { score: 9800000, label: '980만', rank: 'AAA+' },
        { score: 9900000, label: '990만', rank: 'S' }
      ];
      const addedMilestones = [];

      milestones.forEach(mItem => {
        if (mItem.score > sc) {
          const nextRaw = calculateRawVF(lv, mItem.score, clearMark);
          const nextDisp = getDisplayVF(nextRaw);
          const diff = nextDisp - displayVal;

          if (diff > 0.0001) {
            nextTargets.push({
              type: 'score',
              label: mItem.label,
              subLabel: `(${mItem.rank})`,
              score: mItem.score,
              vf: nextDisp,
              gain: diff.toFixed(1)
            });
            addedMilestones.push(mItem.score);
          }
        }
      });

      let searchVF = Number((displayVal + 0.1).toFixed(1));
      const maxSteps = 5;
      let prevFoundScore = -1;

      for (let s = 0; s < maxSteps; s++) {
        let reqScore = calculateMinScore(searchVF, lv, clearMark);

        if (reqScore && reqScore <= 10000000 && reqScore > sc) {

          if (reqScore === 10000000) break;

          if (addedMilestones.includes(reqScore)) {
          }
          else if (reqScore !== prevFoundScore) {
            const gainVal = (searchVF - displayVal).toFixed(1);
            nextTargets.push({
              type: 'smart',
              label: `${reqScore.toLocaleString()}`,
              subLabel: '점',
              vf: searchVF,
              gain: gainVal
            });
            prevFoundScore = reqScore;
          }
        }
        searchVF = Number((searchVF + 0.1).toFixed(1));
      }
    }

    nextTargets.sort((a, b) => parseFloat(a.gain) - parseFloat(b.gain));

    setResult({
      rawVF: rawVF,
      displayVF: displayVal,
      gradeInfo: getGradeInfo(displayVal),
      nextTargets
    });
  };

  const isPerfectScore = parseInt(scoreInput.replace(/,/g, ''), 10) === 10000000;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white pt-6 px-4 pb-20 font-pretendard overflow-hidden">
      <header className="mb-4 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            볼포스 계산기
          </h1>
        </div>
      </header>

      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg mb-2 flex-shrink-0">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[10px] text-slate-400 font-bold ml-1 mb-0.5 block">CONSTANT</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="17.0"
              max="20.9"
              value={levelInput}
              onChange={(e) => setLevelInput(e.target.value)}
              placeholder="18.0"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm font-mono text-white focus:border-pink-500 focus:outline-none transition-colors text-center"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold ml-1 mb-0.5 block">SCORE</label>
            <input
              type="number"
              inputMode="numeric"
              step="10000"
              min="9000000"
              max="10000000"
              value={scoreInput}
              onChange={handleScoreChange}
              onKeyDown={handleScoreKeyDown}
              placeholder="9900000"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm font-mono text-white focus:border-pink-500 focus:outline-none transition-colors text-center"
            />
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between gap-1">
            {['EF', 'EX', 'MXV', 'UC', 'PUC'].map((mark) => {
              const isDisabled = isPerfectScore && mark !== 'PUC';

              return (
                <button
                  key={mark}
                  onClick={() => handleMarkClick(mark)}
                  disabled={isDisabled}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${clearMark === mark
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-900/50'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                    } ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  {mark}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white py-2.5 rounded-lg font-bold shadow-lg shadow-purple-900/30 active:scale-95 transition-all text-xs"
        >
          계산하기
        </button>

        {error && (
          <div className="mt-2 text-center text-red-400 text-[10px] animate-pulse font-medium">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 relative flex flex-col items-center overflow-y-auto no-scrollbar pb-10">
        {result ? (
          <div className="animate-fade-in-up w-full space-y-3">
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 text-center relative overflow-hidden flex-shrink-0 mx-2 shadow-xl">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"></div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${result.gradeInfo.style}`}>
                  {result.gradeInfo.name}
                </span>
              </div>

              <div className="flex flex-row items-baseline justify-center gap-2">
                <span className={`text-5xl font-black tracking-tighter ${result.displayVF >= 40 ? 'text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]' :
                    result.displayVF >= 38 ? 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]' :
                      result.displayVF >= 36 ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]' :
                        'text-white'
                  }`}>
                  {result.displayVF.toFixed(1)}
                </span>
                <span className="text-slate-500 font-mono text-sm">
                  ({result.rawVF.toFixed(6)})
                </span>
              </div>
            </div>

            {result.nextTargets && result.nextTargets.length > 0 && (
              <div className="mx-2">
                <h3 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 ml-1 mb-2">
                  <TrendingUp size={14} className="text-cyan-400" />
                  NEXT TARGETS
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {result.nextTargets.map((target, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col justify-between h-full relative overflow-hidden group hover:border-slate-700 transition-colors">

                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-sm font-bold tracking-tight ${target.type === 'score' ? 'text-yellow-200' :
                                target.type === 'smart' ? 'text-cyan-100' : 'text-pink-200'
                              }`}>{target.label}</span>
                            {target.subLabel && <span className="text-[10px] text-slate-500">{target.subLabel}</span>}
                          </div>
                        </div>
                        <div className={`p-1.5 rounded-lg ${target.type === 'mark' ? 'bg-pink-500/10 text-pink-400' :
                            target.type === 'score' ? 'bg-yellow-500/10 text-yellow-400' :
                              'bg-cyan-500/10 text-cyan-400'
                          }`}>
                          {target.type === 'mark' && <Medal size={14} />}
                          {target.type === 'score' && <Trophy size={14} />}
                          {target.type === 'smart' && <Target size={14} />}
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-slate-950/50 rounded-lg p-1.5 pr-2 border border-slate-800/50">
                        <span className={`text-[10px] font-bold ${getGradeInfo(target.vf).style.split(' ')[0]}`}>
                          VF {target.vf.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-0.5 text-cyan-400 font-mono font-bold">
                          <span className="text-[11px]">(+{target.gain})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!result.nextTargets && parseInt(scoreInput.replace(/,/g, ''), 10) === 10000000 && (
              <div className="mx-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800 border-dashed flex flex-col items-center justify-center text-slate-500 gap-2">
                <Trophy size={24} className="text-yellow-500 opacity-50" />
                <span className="text-xs">이미 최고 점수(PUC)입니다!</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-700 opacity-50 pb-10 h-full">
            <Calculator size={48} strokeWidth={1} className="mb-3" />
            <p className="text-sm">상수, 점수, 클리어 마크를 선택해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('table');
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const [tableLevel, setTableLevel] = useState(17);
  const [tableConstant, setTableConstant] = useState(17.0);

  const [calcLevelInput, setCalcLevelInput] = useState('18.0');
  const [calcScoreInput, setCalcScoreInput] = useState('9900000');
  const [calcClearMark, setCalcClearMark] = useState(null);
  const [calcResult, setCalcResult] = useState(null);

  const handleTableLevelChange = (newLevel) => {
    setTableLevel(newLevel);
    if (newLevel === 17) setTableConstant(17.0);
    else setTableConstant(Number(newLevel.toFixed(1)));
  };

  useEffect(() => {
    const setVh = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  return (
    <div
      className="flex justify-center bg-black min-h-screen font-pretendard"
      style={{ minHeight: '100svh' }}
    >
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css");
        .font-pretendard { font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif; }
      `}</style>

      <div className="w-full max-w-md bg-slate-950 relative shadow-2xl overflow-hidden flex flex-col h-[100svh]">
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={() => setIsAboutOpen(true)}
            className="text-slate-500 hover:text-cyan-400 transition-colors p-2"
          >
            <Info size={20} />
          </button>
        </div>

        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'table' ? (
            <VolforceTableView
              level={tableLevel}
              onLevelChange={handleTableLevelChange}
              constant={tableConstant}
              setConstant={setTableConstant}
            />
          ) : (
            <CalculatorView
              levelInput={calcLevelInput}
              setLevelInput={setCalcLevelInput}
              scoreInput={calcScoreInput}
              setScoreInput={setCalcScoreInput}
              clearMark={calcClearMark}
              setClearMark={setCalcClearMark}
              result={calcResult}
              setResult={setCalcResult}
            />
          )}
        </main>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </div>

      <style jsx global>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 2px;
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
        @keyframes scale-up {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
            animation: scale-up 0.2s ease-out forwards;
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
           opacity: 1; 
           cursor: pointer;
        }
      `}</style>
    </div>
  );
}
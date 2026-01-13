import React, { useState, useEffect, useRef } from 'react'; 
import { generateLevels } from './services/geminiService';

const PepperoniSet = () => (
  <>
    <div className="pepperoni" style={{ top: '20%', left: '30%' }}></div>
    <div className="pepperoni" style={{ top: '25%', left: '60%' }}></div>
    <div className="pepperoni" style={{ top: '50%', left: '20%' }}></div>
    <div className="pepperoni" style={{ top: '55%', left: '70%' }}></div>
    <div className="pepperoni" style={{ top: '70%', left: '45%' }}></div>
    <div className="pepperoni" style={{ top: '40%', left: '45%' }}></div>
  </>
);

const PizzaRender = ({ mask, isSlice }) => {
  return (
    <div 
      className={`pizza-body transition-all duration-300 ${isSlice ? 'scale-95 hover:scale-105' : ''}`}
      style={{ clipPath: mask, width: '100%', height: '100%', background: '#ffa500', borderRadius: '50%', position: 'relative', overflow: 'hidden' }}
    >
      <div className="pizza-cheese" style={{ position: 'absolute', inset: '10px', background: '#ffd700', borderRadius: '50%' }} />
      <PepperoniSet />
    </div>
  );
};

const App = () => {
  const [levels, setLevels] = useState([]);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [placedCakes, setPlacedCakes] = useState([]);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [answer, setAnswer] = useState({ mode: 'mixed', whole: '', numerator: '', denominator: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [knifePos, setKnifePos] = useState({ x: 0, y: 0, active: false });
  const [draggingId, setDraggingId] = useState(null);
  const [readyToCutId, setReadyToCutId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  
  const [cutMenu, setCutMenu] = useState({ active: false, pizzaId: null, den: '' });

  const containerRef = useRef(null);
  const workspaceRef = useRef(null);
  const targetZoneRef = useRef(null);

  useEffect(() => {
    generateLevels().then(data => {
      if (data && data.length > 0) {
        setLevels(data);
        setIsLoading(false);
      }
    });
  }, []);

  const currentLevel = (levels && levels.length > 0) ? levels[currentLevelIdx] : null;

  // SỬA LỖI 1: Tối ưu hóa việc tính toán tọa độ khi di chuyển
  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Ưu tiên xử lý kéo bánh nếu đang trong trạng thái dragging
    if (draggingId) {
      setPlacedCakes(prev => prev.map(c => 
        c.id === draggingId ? { ...c, x, y } : c
      ));
      return; 
    }

    // Logic dùng dao cắt bánh
    if (knifePos.active) {
      setKnifePos(prev => ({ ...prev, x, y }));
      let foundCutTarget = null;
      placedCakes.forEach(cake => {
        if (!cake.isSlice) {
          const dist = Math.hypot(x - cake.x, y - cake.y);
          if (dist >= 30 && dist <= 160) foundCutTarget = cake.id;
        }
      });
      if (foundCutTarget && foundCutTarget !== cutMenu.pizzaId) {
        setCutMenu({ active: true, pizzaId: foundCutTarget, den: '' });
      }
      setReadyToCutId(foundCutTarget);
    }
  };

  const handlePointerUp = (e) => {
    if (draggingId) {
      const rect = workspaceRef.current?.getBoundingClientRect();
      if (rect) {
        // Kiểm tra nếu bánh bị kéo ra ngoài vùng làm việc thì xóa
        if (e.clientX > rect.right || e.clientX < rect.left || e.clientY < rect.top || e.clientY > rect.bottom) {
          setPlacedCakes(prev => prev.filter(c => c.id !== draggingId));
        }
      }
      setDraggingId(null);
    }
    if (!cutMenu.active) {
      setKnifePos(prev => ({ ...prev, active: false }));
      setReadyToCutId(null);
    }
  };

  const handleNewPizzaStart = (e) => { e.dataTransfer.setData('type', 'new-pizza'); };

  const handleWorkspaceDrop = (e) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (e.dataTransfer.getData('type') === 'new-pizza') {
      const newId = Math.random().toString(36).substr(2, 9);
      setPlacedCakes([...placedCakes, { id: newId, x, y, isCut: false, slices: 1, isSlice: false }]);
    }
  };

  const executeCut = () => {
    if (!cutMenu.pizzaId) return;
    const targetCake = placedCakes.find(c => c.id === cutMenu.pizzaId);
    if (!targetCake) return;
    const numSlices = parseInt(cutMenu.den);
    if (isNaN(numSlices) || numSlices <= 1) {
      alert("Hãy nhập số phần muốn chia vào mẫu số!");
      return;
    }
    const sliceAngle = 360 / numSlices;
    const newSlices = Array.from({ length: numSlices }).map((_, i) => {
      const startAngle = sliceAngle * i;
      const midAngle = startAngle + sliceAngle / 2;
      const rad = (midAngle - 90) * (Math.PI / 180);
      return {
        id: Math.random().toString(36).substr(2, 9),
        x: targetCake.x + Math.cos(rad) * 35,
        y: targetCake.y + Math.sin(rad) * 35,
        isCut: true,
        slices: numSlices,
        startAngle: startAngle,
        isSlice: true
      };
    });
    setPlacedCakes(prev => [...prev.filter(c => c.id !== cutMenu.pizzaId), ...newSlices]);
    setCutMenu({ active: false, pizzaId: null, den: '' });
    setKnifePos(prev => ({ ...prev, active: false }));
  };

  const handleFinalConfirm = () => {
    if (!currentLevel) return;
    const targetZone = targetZoneRef.current?.getBoundingClientRect();
    if (!targetZone) return;
    const containerRect = containerRef.current?.getBoundingClientRect();
    const cakesInZone = placedCakes.filter(cake => {
      return cake.x > (targetZone.left - containerRect.left) &&
             cake.x < (targetZone.right - containerRect.left) &&
             cake.y > (targetZone.top - containerRect.top) &&
             cake.y < (targetZone.bottom - containerRect.top);
    });
    if (cakesInZone.length === 0) {
      alert("Hãy kéo các phần bánh vào chiếc đĩa!");
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
      return;
    }
    const totalValueInZone = cakesInZone.reduce((acc, cake) => acc + (cake.isSlice ? (1 / cake.slices) : 1.0), 0);
    const expectedValue = currentLevel.totalCakes / currentLevel.shareWith;
    if (Math.abs(totalValueInZone - expectedValue) > 0.001) {
      alert("Số lượng bánh trong đĩa chưa đúng!");
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
      return;
    }
    setFeedback('correct');
    setTimeout(() => { setFeedback(null); setIsInputOpen(true); }, 1000);
  };

  const checkNumericalAnswer = () => {
    if (!currentLevel) return;
    const isCorrect = 
      parseInt(answer.whole || '0') === currentLevel.correctWhole &&
      parseInt(answer.numerator || '0') === currentLevel.correctNumerator &&
      parseInt(answer.denominator || '0') === currentLevel.correctDenominator;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setTimeout(() => {
        setFeedback(null);
        setIsInputOpen(false);
        if (currentLevelIdx < levels.length - 1) {
          setCurrentLevelIdx(currentLevelIdx + 1);
          setPlacedCakes([]);
          setAnswer({ mode: 'mixed', whole: '', numerator: '', denominator: '' });
        } else { alert("Tuyệt vời! Bạn đã hoàn thành bài học!"); }
      }, 2000);
    } else { setTimeout(() => setFeedback(null), 1500); }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center text-5xl agbalumo animate-pulse">🍕 Đang chuẩn bị bàn tiệc...</div>;

  const targetPizzaForCut = placedCakes.find(c => c.id === cutMenu.pizzaId);

  return (
    // SỬA LỖI 2: touch-action: none để chặn trình duyệt cuộn trang khi đang kéo bánh
    <div ref={containerRef} className="game-container agbalumo select-none" style={{ touchAction: 'none' }} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <div className="bg-white/95 p-6 border-b-4 border-rose-300 flex items-center justify-center text-center z-20 shadow-md">
        <p className="text-2xl md:text-3xl lg:text-4xl text-rose-900 leading-tight">
          <span className="text-rose-500 mr-2">Màn {currentLevelIdx + 1}:</span> 
          {currentLevel ? currentLevel.problem : "Đang tải câu hỏi..."}
        </p>
      </div>

      <div ref={workspaceRef} className="workspace" onDragOver={(e) => e.preventDefault()} onDrop={handleWorkspaceDrop}>
        <div ref={targetZoneRef} className="absolute right-10 top-1/2 -translate-y-1/2 w-[300px] h-[440px] border-4 border-dashed border-rose-300 bg-rose-50/30 rounded-[60px] flex flex-col items-center justify-start p-8 pointer-events-none">
          <div className="bg-rose-500 text-white text-[16px] px-5 py-2 rounded-full mb-6 shadow-sm font-bold">VÙNG ĐÁP ÁN</div>
          <p className="text-rose-800 text-center text-2xl leading-tight font-bold mb-6">1 phần sau khi chia bánh là:</p>
          <div className="flex-1 flex items-center justify-center w-full">
             <div className="w-52 h-52 bg-white rounded-full border-8 border-slate-100 shadow-inner flex items-center justify-center relative">
                <div className="text-slate-200 text-6xl opacity-20 select-none">🍽️</div>
             </div>
          </div>
        </div>

        {placedCakes.map(cake => (
          <div 
            key={cake.id} 
            className={`pizza-placed ${cake.isSlice ? 'w-[140px] h-[140px]' : ''}`}
            style={{ 
              left: cake.x - (cake.isSlice ? 70 : 90), 
              top: cake.y - (cake.isSlice ? 70 : 90), 
              width: cake.isSlice ? 140 : 180, 
              height: cake.isSlice ? 140 : 180, 
              zIndex: draggingId === cake.id ? 100 : 5,
              touchAction: 'none' // Ngăn trình duyệt can thiệp vào cảm ứng
            }}
            // SỬA LỖI 3: setPointerCapture để "khóa" bánh vào tay người dùng
            onPointerDown={(e) => {
              if (!knifePos.active) {
                e.currentTarget.setPointerCapture(e.pointerId);
                setDraggingId(cake.id);
                setCutMenu({ active: false, pizzaId: null, den: '' });
              }
            }}
          >
            <div className="pizza-content">
              {!cake.isSlice ? <PizzaRender /> : <PizzaRender isSlice mask={`conic-gradient(from ${cake.startAngle}deg, black ${360/cake.slices}deg, transparent 0deg)`} />}
            </div>
          </div>
        ))}

        {cutMenu.active && targetPizzaForCut && (
          <div className="absolute z-[120] bg-white p-6 rounded-[40px] shadow-2xl border-4 border-rose-500 flex flex-col items-center gap-4"
            style={{ left: targetPizzaForCut.x + 100, top: targetPizzaForCut.y - 120 }}>
            <input type="number" autoFocus placeholder="?" value={cutMenu.den} onChange={(e) => setCutMenu({ ...cutMenu, den: e.target.value })}
                className="w-18 h-18 border-4 border-rose-400 rounded-2xl text-center text-4xl outline-none agbalumo" />
            <div className="flex gap-3 w-full">
              <button onClick={() => { setCutMenu({ active: false, pizzaId: null, den: '' }); setKnifePos({ ...knifePos, active: false }); }} className="flex-1 bg-slate-100 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500">HỦY</button>
              <button onClick={executeCut} className="flex-1 bg-rose-500 text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-lg">CẮT</button>
            </div>
          </div>
        )}
        <button onClick={handleFinalConfirm} className="btn-done agbalumo hover:scale-105 active:scale-95 text-4xl py-6 px-16">XÁC NHẬN</button>
      </div>

      <div className="bottom-tools">
        <div className="flex flex-col items-center justify-center border-r-4 border-rose-200 p-4">
          <p className="mb-3 text-2xl text-rose-800 font-bold">🍕 Bánh Mới</p>
          <div draggable onDragStart={handleNewPizzaStart} className="cursor-grab active:scale-90 w-28 h-28 flex items-center justify-center">
             <div className="w-20 h-20 bg-amber-500 rounded-full border-4 border-amber-800 flex items-center justify-center text-[12px] font-bold text-white shadow-lg text-center leading-none px-2 uppercase">Kéo Pizza</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-4">
          <p className="mb-3 text-2xl text-rose-800 font-bold">🔪 Dùng Dao</p>
          <div onPointerDown={(e) => { const rect = containerRef.current?.getBoundingClientRect(); setKnifePos({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }); }}
            className={`w-28 h-28 bg-white border-4 rounded-full flex items-center justify-center text-7xl shadow-xl active:scale-95 ${knifePos.active ? 'border-rose-600 bg-rose-100' : 'border-rose-400'}`}>🔪</div>
        </div>
      </div>

      {isInputOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center backdrop-blur-md">
          <div className="input-popup w-[650px] p-16 flex flex-col items-center">
            <h2 className="text-5xl mb-12 text-rose-900 border-b-4 border-rose-500 pb-4 text-center">Mỗi người nhận được?</h2>
            <div className="flex gap-6 mb-12">
              {['natural', 'fraction', 'mixed'].map(m => (
                <button key={m} onClick={() => setAnswer({ ...answer, mode: m })}
                  className={`p-8 border-4 rounded-[40px] flex flex-col items-center transition-all ${answer.mode === m ? 'border-rose-600 bg-rose-50 scale-105 shadow-xl' : 'border-slate-200 bg-white'}`}>
                   <span className="text-sm mt-2 font-bold uppercase">{m === 'natural' ? 'Số nguyên' : m === 'fraction' ? 'Phân số' : 'Hỗn số'}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-8 mb-16 h-48">
              {(answer.mode === 'natural' || answer.mode === 'mixed') && (
                <input className="w-24 h-36 border-4 border-black rounded-3xl text-center text-7xl outline-none agbalumo" placeholder="0" type="number" value={answer.whole} onChange={(e) => setAnswer({ ...answer, whole: e.target.value })} />
              )}
              {(answer.mode === 'fraction' || answer.mode === 'mixed') && (
                <div className="flex flex-col items-center gap-3">
                  <input className="w-20 h-20 border-4 border-black rounded-2xl text-center text-4xl outline-none agbalumo" placeholder="?" type="number" value={answer.numerator} onChange={(e) => setAnswer({ ...answer, numerator: e.target.value })} />
                  <div className="w-24 h-2 bg-black rounded-full" />
                  <input className="w-20 h-20 border-4 border-black rounded-2xl text-center text-4xl outline-none agbalumo" placeholder="?" type="number" value={answer.denominator} onChange={(e) => setAnswer({ ...answer, denominator: e.target.value })} />
                </div>
              )}
            </div>
            <div className="flex gap-6 w-full">
               <button onClick={() => setIsInputOpen(false)} className="flex-1 bg-slate-100 text-slate-600 text-2xl py-6 rounded-[40px] agbalumo">HỦY</button>
               <button onClick={checkNumericalAnswer} className="flex-[2] bg-rose-600 text-white text-4xl py-6 rounded-[40px] shadow-2xl active:scale-95 agbalumo">KIỂM TRA</button>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/40`}>
          <div className={`p-20 rounded-[80px] bg-white shadow-2xl border-8 ${feedback === 'correct' ? 'border-green-500' : 'border-red-500'}`}>
             <div className="text-center text-8xl">{feedback === 'correct' ? '✅' : '❌'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BoxIcon, 
  QrCodeIcon, 
  SearchIcon, 
  PlusIcon, 
  ArrowLeftIcon,
  SparklesIcon,
  EditIcon,
  TrashIcon,
  XIcon
} from './components/Icons';
import Scanner from './components/Scanner';
import { 
  getBoxes, 
  saveBoxes, 
  addBox, 
  updateBox, 
  addItemToBox, 
  updateItemInBox,
  deleteItemFromBox,
  deleteBox
} from './services/storageService';
import { suggestAttributes, smartSearchInterpretation } from './services/geminiService';
import { Box, InventoryItem, ViewState, ItemAttribute } from './types';
import { BOX_COLORS, INITIAL_BOXES } from './constants';

function App() {
  const [view, setView] = useState<ViewState>({ type: 'DASHBOARD' });
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [searchResults, setSearchResults] = useState<{box: Box, item: InventoryItem}[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]); // For smart search expansion terms

  // Load initial data
  useEffect(() => {
    setBoxes(getBoxes());
  }, []);

  // --- View Helpers ---
  const currentBox = useMemo(() => {
    if (view.type === 'BOX_DETAIL' || view.type === 'ITEM_FORM') {
      return boxes.find(b => b.id === view.boxId);
    }
    if (view.type === 'BOX_FORM' && view.boxId) {
      return boxes.find(b => b.id === view.boxId);
    }
    return null;
  }, [boxes, view]);

  const currentItem = useMemo(() => {
    if (view.type === 'ITEM_FORM' && view.itemId && currentBox) {
      return currentBox.items.find(i => i.id === view.itemId);
    }
    return null;
  }, [currentBox, view]);

  // --- Handlers ---
  
  const handleScan = (code: string) => {
    const foundBox = boxes.find(b => b.id === code);
    if (foundBox) {
      setView({ type: 'BOX_DETAIL', boxId: foundBox.id });
    } else {
      // Suggest creating a new box
      if(confirm(`未找到箱子 ID "${code}"。是否立即创建？`)) {
        setView({ type: 'BOX_FORM', scannedId: code });
      } else {
         setView({ type: 'DASHBOARD' });
      }
    }
  };

  const handleSearch = async (query: string) => {
      setSearchQuery(query);
      if(!query) {
          setSearchResults([]);
          setAiSuggestions([]);
          return;
      }
      
      const lowerQ = query.toLowerCase();
      
      // 1. Basic Local Search
      let results: {box: Box, item: InventoryItem}[] = [];
      boxes.forEach(box => {
          box.items.forEach(item => {
              if (item.name.toLowerCase().includes(lowerQ) || 
                  item.category?.toLowerCase().includes(lowerQ) || 
                  item.attributes.some(a => a.value.toLowerCase().includes(lowerQ))) {
                  results.push({ box, item });
              }
          });
      });
      setSearchResults(results);

      // 2. AI Expansion (Debounced in real app, triggered on enter here or by button)
  };
  
  const handleSmartSearch = async () => {
    if(!searchQuery) return;
    setIsProcessingAI(true);
    const synonyms = await smartSearchInterpretation(searchQuery);
    setAiSuggestions(synonyms);
    
    // Re-run search with expanded terms
    const expandedResults: {box: Box, item: InventoryItem}[] = [];
    const seenIds = new Set(searchResults.map(r => r.item.id));
    
    boxes.forEach(box => {
        box.items.forEach(item => {
            if(seenIds.has(item.id)) return;
            // Check if any synonym matches
            const match = synonyms.some(s => 
                item.name.toLowerCase().includes(s.toLowerCase()) || 
                item.category?.toLowerCase().includes(s.toLowerCase())
            );
            if(match) {
                expandedResults.push({ box, item });
                seenIds.add(item.id);
            }
        });
    });
    
    setSearchResults(prev => [...prev, ...expandedResults]);
    setIsProcessingAI(false);
  }

  const handleDeleteItem = (boxId: string, itemId: string) => {
      if(confirm("确定要删除此物品吗？")) {
        const updated = deleteItemFromBox(boxId, itemId);
        setBoxes(updated);
      }
  };

  // --- Sub-Components (Defined locally for simplicity in single-file gen constraints, though typically separate) ---

  const Dashboard = () => (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">我的物品</h1>
           <p className="text-slate-500 text-sm">{boxes.length} 个箱子 • {boxes.reduce((acc, b) => acc + b.items.length, 0)} 件物品</p>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setView({ type: 'SCANNER' })}
          className="bg-brand-600 text-white p-4 rounded-xl shadow-lg shadow-brand-200 flex flex-col items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
        >
          <QrCodeIcon className="w-8 h-8" />
          <span className="font-semibold">扫一扫</span>
        </button>
        <button 
          onClick={() => setView({ type: 'SEARCH' })}
          className="bg-white text-slate-700 border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <SearchIcon className="w-8 h-8" />
          <span className="font-semibold">搜物品</span>
        </button>
      </div>

      {/* Recent Boxes */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">我的箱子</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {boxes.map(box => (
            <div 
              key={box.id}
              onClick={() => setView({ type: 'BOX_DETAIL', boxId: box.id })} 
              className={`p-4 rounded-xl border border-slate-100 shadow-sm cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 ${box.color || 'bg-white'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-slate-800">{box.name}</div>
                <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded text-slate-600">#{box.id}</span>
              </div>
              <div className="text-sm text-slate-600 mb-3 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {box.location}
              </div>
              <div className="flex -space-x-2 overflow-hidden">
                {box.items.slice(0, 4).map((item, i) => (
                   <div key={item.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase" title={item.name}>
                     {item.name.charAt(0)}
                   </div>
                ))}
                {box.items.length > 4 && (
                   <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                     +{box.items.length - 4}
                   </div>
                )}
              </div>
            </div>
          ))}
          {/* Add New Box Button */}
           <div 
              onClick={() => setView({ type: 'BOX_FORM' })}
              className="p-4 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-brand-400 hover:text-brand-500 min-h-[120px]"
            >
                <PlusIcon className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">添加箱子</span>
            </div>
        </div>
      </div>
    </div>
  );

  const BoxForm = ({ existingBox, scannedId }: { existingBox?: Box, scannedId?: string }) => {
    const [name, setName] = useState(existingBox?.name || '');
    const [location, setLocation] = useState(existingBox?.location || '');
    const [color, setColor] = useState(existingBox?.color || BOX_COLORS[0]);
    // If scanning, use scanned ID, else use existing ID, else generate one
    const [id, setId] = useState(existingBox?.id || scannedId || `box-${Date.now().toString().slice(-4)}`);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const boxData: Box = {
            id,
            name,
            location,
            color,
            items: existingBox?.items || []
        };

        if (existingBox) {
            const updated = updateBox(boxData);
            setBoxes(updated);
        } else {
            const updated = addBox(boxData);
            setBoxes(updated);
        }
        setView({ type: 'BOX_DETAIL', boxId: id });
    };

    return (
        <div className="pb-10">
             <div className="flex items-center gap-3 mb-6">
                <button 
                    onClick={() => existingBox ? setView({ type: 'BOX_DETAIL', boxId: existingBox.id }) : setView({ type: 'DASHBOARD' })} 
                    className="p-2 -ml-2 rounded-full hover:bg-slate-200"
                >
                    <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="text-xl font-bold text-slate-900">{existingBox ? '编辑箱子属性' : '创建新箱子'}</h1>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">箱子 ID (二维码内容)</label>
                        <input 
                            type="text" 
                            value={id} 
                            disabled={!!existingBox} // ID cannot be changed once created to maintain QR link
                            onChange={e => setId(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-500 font-mono text-sm"
                        />
                         <p className="text-[10px] text-slate-400 mt-1">
                             {existingBox ? '箱子 ID 无法修改，因为它与二维码绑定。' : '如果您有预制的二维码，请在此输入或扫描。'}
                         </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">箱子名称</label>
                        <input 
                            required
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            placeholder="例如：书房杂物、冬季衣物"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">存放位置</label>
                        <input 
                            required
                            type="text" 
                            value={location} 
                            onChange={e => setLocation(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            placeholder="例如：主卧衣柜、地下室货架 A1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">外观颜色标记</label>
                        <div className="flex flex-wrap gap-3">
                            {BOX_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform ${c} ${color === c ? 'border-brand-600 scale-110 ring-2 ring-brand-200' : 'border-transparent hover:scale-105'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
                >
                    {existingBox ? '保存修改' : '创建箱子'}
                </button>
             </form>
        </div>
    );
  };

  const BoxDetail = ({ box }: { box: Box }) => (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView({ type: 'DASHBOARD' })} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
          <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
        </button>
        <div className="flex-1">
           <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{box.name}</h1>
                <button 
                    onClick={() => setView({ type: 'BOX_FORM', boxId: box.id })}
                    className="p-1.5 text-slate-400 hover:text-brand-600 bg-white border border-slate-200 rounded-lg shadow-sm"
                    title="编辑箱子属性"
                >
                    <EditIcon className="w-4 h-4" />
                </button>
           </div>
           <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
             <span>{box.location}</span> • <span className="font-mono text-xs bg-slate-100 px-1 rounded">ID: {box.id}</span>
           </p>
        </div>
        <button 
            onClick={() => {
                if(confirm("确定删除此箱子及其所有内容吗？")) {
                    const u = deleteBox(box.id);
                    setBoxes(u);
                    setView({ type: 'DASHBOARD' });
                }
            }}
            className="p-2 rounded-full hover:bg-red-50 text-red-500"
        >
            <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
         {box.items.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <BoxIcon className="w-8 h-8 text-slate-300" />
                 </div>
                 <p className="text-slate-500">此箱子是空的。</p>
             </div>
         ) : (
            box.items.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between group">
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{item.name}</h3>
                        <p className="text-sm text-slate-500 mb-2">{item.description || item.category}</p>
                        
                        {/* Chips for attributes */}
                        <div className="flex flex-wrap gap-1">
                            {item.attributes.slice(0, 3).map((attr, idx) => (
                                <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                                    {attr.key}: {attr.value}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 pl-2 border-l border-slate-50 ml-2">
                         <button 
                            onClick={() => setView({ type: 'ITEM_FORM', boxId: box.id, itemId: item.id })}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                         >
                             <EditIcon className="w-5 h-5" />
                         </button>
                         <button 
                            onClick={() => handleDeleteItem(box.id, item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                         >
                             <TrashIcon className="w-5 h-5" />
                         </button>
                    </div>
                </div>
            ))
         )}
      </div>

      {/* FAB to add item */}
      <button 
        onClick={() => setView({ type: 'ITEM_FORM', boxId: box.id })}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg shadow-brand-500/40 flex items-center justify-center hover:bg-brand-700 transition-transform active:scale-95"
      >
        <PlusIcon className="w-8 h-8" />
      </button>
    </div>
  );

  const ItemForm = ({ box, existingItem }: { box: Box, existingItem?: InventoryItem }) => {
     const [name, setName] = useState(existingItem?.name || '');
     const [description, setDescription] = useState(existingItem?.description || '');
     const [category, setCategory] = useState(existingItem?.category || '');
     const [attributes, setAttributes] = useState<ItemAttribute[]>(existingItem?.attributes || []);
     const [loadingAi, setLoadingAi] = useState(false);

     const handleAiSuggest = async () => {
         if(!name) return;
         setLoadingAi(true);
         const suggestions = await suggestAttributes(name, description);
         if (suggestions.length > 0) {
             // Merge suggestions, prioritize existing keys if conflict (or overwrite? let's append/overwrite)
             const newAttrs = [...attributes];
             suggestions.forEach(s => {
                 const idx = newAttrs.findIndex(a => a.key === s.key);
                 if (idx === -1) newAttrs.push(s);
                 else newAttrs[idx] = s;
             });
             setAttributes(newAttrs);
         }
         setLoadingAi(false);
     };

     const handleSubmit = (e: React.FormEvent) => {
         e.preventDefault();
         const item: InventoryItem = {
             id: existingItem?.id || `item-${Date.now()}`,
             name,
             description,
             category,
             quantity: existingItem?.quantity || 1,
             attributes,
             addedAt: existingItem?.addedAt || new Date().toISOString()
         };

         if (existingItem) {
             const updatedBoxes = updateItemInBox(box.id, item);
             setBoxes(updatedBoxes);
         } else {
             const updatedBoxes = addItemToBox(box.id, item);
             setBoxes(updatedBoxes);
         }
         setView({ type: 'BOX_DETAIL', boxId: box.id });
     };

     return (
         <div className="pb-10">
             <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView({ type: 'BOX_DETAIL', boxId: box.id })} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
                    <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="text-xl font-bold text-slate-900">{existingItem ? '编辑物品' : '添加物品'}</h1>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">物品名称</label>
                     <input 
                        required
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        placeholder="例如：5号电池"
                     />
                 </div>
                 
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                     <textarea 
                        value={description} 
                        onChange={e => setDescription(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        rows={2}
                        placeholder="成色、颜色、购买日期..."
                     />
                 </div>

                 {/* AI Attribute Suggester */}
                 <div className="bg-brand-50 p-4 rounded-xl border border-brand-100">
                     <div className="flex justify-between items-center mb-3">
                         <h3 className="font-semibold text-brand-900 text-sm">属性</h3>
                         <button 
                            type="button"
                            onClick={handleAiSuggest}
                            disabled={loadingAi || !name}
                            className="text-xs flex items-center gap-1 bg-brand-200 text-brand-800 px-2 py-1 rounded-md hover:bg-brand-300 disabled:opacity-50"
                         >
                            <SparklesIcon className="w-3 h-3" />
                            {loadingAi ? '思考中...' : 'AI 自动填充'}
                         </button>
                     </div>
                     <div className="space-y-2">
                         {attributes.map((attr, idx) => (
                             <div key={idx} className="flex gap-2">
                                 <input 
                                    type="text" 
                                    value={attr.key}
                                    onChange={(e) => {
                                        const newAttrs = [...attributes];
                                        newAttrs[idx].key = e.target.value;
                                        setAttributes(newAttrs);
                                    }}
                                    className="flex-1 text-sm p-2 border border-slate-200 rounded"
                                    placeholder="属性名 (如：电压)"
                                 />
                                 <input 
                                    type="text" 
                                    value={attr.value}
                                    onChange={(e) => {
                                        const newAttrs = [...attributes];
                                        newAttrs[idx].value = e.target.value;
                                        setAttributes(newAttrs);
                                    }}
                                    className="flex-1 text-sm p-2 border border-slate-200 rounded"
                                    placeholder="属性值 (如：1.5V)"
                                 />
                                 <button 
                                    type="button"
                                    onClick={() => {
                                        setAttributes(attributes.filter((_, i) => i !== idx));
                                    }}
                                    className="text-slate-400 hover:text-red-500"
                                 >
                                    <XIcon className="w-4 h-4" />
                                 </button>
                             </div>
                         ))}
                         <button 
                            type="button"
                            onClick={() => setAttributes([...attributes, {key: '', value: ''}])}
                            className="text-sm text-brand-600 font-medium hover:text-brand-700"
                         >
                             + 添加属性
                         </button>
                     </div>
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">分类 (可选)</label>
                     <input 
                        type="text" 
                        value={category} 
                        onChange={e => setCategory(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        placeholder="例如：电子产品"
                     />
                 </div>

                 <button 
                    type="submit"
                    className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
                 >
                     保存物品
                 </button>
             </form>
         </div>
     );
  };

  const SearchInterface = () => (
      <div className="h-full flex flex-col pb-6">
        <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setView({ type: 'DASHBOARD' })} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
                <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
            </button>
            <div className="relative flex-1">
                <input 
                    type="text" 
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="搜索物品、分类..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-sm"
                />
                <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
        </div>
        
        {/* AI Suggestions / Smart Search Trigger */}
        {searchQuery && searchResults.length === 0 && !isProcessingAI && (
            <div className="bg-brand-50 p-4 rounded-lg mb-4 text-center">
                <p className="text-sm text-brand-800 mb-2">未找到精确匹配。</p>
                <button 
                    onClick={handleSmartSearch}
                    className="flex items-center justify-center gap-2 mx-auto bg-white border border-brand-200 text-brand-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-brand-50"
                >
                    <SparklesIcon className="w-4 h-4" />
                    尝试 AI 智能搜索
                </button>
            </div>
        )}
        
        {isProcessingAI && (
             <div className="text-center py-8">
                 <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-2"></div>
                 <p className="text-sm text-slate-500">正在询问 Gemini 查找相关物品...</p>
             </div>
        )}

        {/* AI Tags */}
        {aiSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider py-1">正在搜索：</span>
                {aiSuggestions.map(tag => (
                    <span key={tag} className="bg-brand-100 text-brand-700 text-xs px-2 py-1 rounded-full">
                        {tag}
                    </span>
                ))}
            </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
            {searchResults.map(({box, item}) => (
                <div 
                    key={item.id} 
                    onClick={() => setView({ type: 'BOX_DETAIL', boxId: box.id })}
                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 cursor-pointer hover:border-brand-300"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 font-bold text-slate-500">
                        {item.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <h3 className="font-semibold text-slate-900">{item.name}</h3>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">箱子 #{box.id}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-1">{item.description}</p>
                        <p className="text-xs text-brand-600 font-medium">位置：{box.location}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-200">
      <div className="max-w-md mx-auto min-h-screen relative bg-slate-50 shadow-2xl">
        {view.type === 'SCANNER' && (
          <Scanner onScan={handleScan} onClose={() => setView({ type: 'DASHBOARD' })} />
        )}

        <main className="p-6 min-h-screen">
          {view.type === 'DASHBOARD' && <Dashboard />}
          {view.type === 'BOX_DETAIL' && currentBox && <BoxDetail box={currentBox} />}
          {view.type === 'ITEM_FORM' && currentBox && <ItemForm box={currentBox} existingItem={currentItem || undefined} />}
          {view.type === 'BOX_FORM' && <BoxForm existingBox={currentBox || undefined} scannedId={view.scannedId} />}
          {view.type === 'SEARCH' && <SearchInterface />}
        </main>
      </div>
    </div>
  );
}

export default App;

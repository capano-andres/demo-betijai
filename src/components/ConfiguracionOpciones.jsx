import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import Modal from './Modal';
import './ConfiguracionOpciones.css';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const MENUS_DEFAULT = [
  'BETI JAI', 'CLASICO', 'DIETA BLANDA', 'ENSALADA',
  'LIGHT', 'MENU PBT X 2', 'PASTAS', 'SAND DE MIGA'
];
const POSTRES_DEFAULT = ['C/GELATINA', 'C/POSTRE', 'C/YOGURT'];
const BEBIDAS_DEFAULT = [
  'AGUA CON GAS', 'AGUA SIN GAS', 'AQUARIOS MANZANA',
  'COCA', 'COCA ZERO', 'SPRITE'
];

const buildDefault = () => ({
  menus: Object.fromEntries(DIAS_SEMANA.map(d => [d, [...MENUS_DEFAULT]])),
  postres: [...POSTRES_DEFAULT],
  bebidas: [...BEBIDAS_DEFAULT],
});

const DOC_ID = 'opcionesMenuCascada';

const ConfiguracionOpciones = ({ readOnly = false }) => {
  const [config, setConfig] = useState(buildDefault());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [activeDia, setActiveDia] = useState('Lunes');
  const [inputs, setInputs] = useState({ menu: '', postre: '', bebida: '' });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const db = getFirestore();
      const ref = doc(db, 'config', DOC_ID);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setConfig(snap.data());
      } else {
        const defaults = buildDefault();
        await setDoc(ref, defaults);
        setConfig(defaults);
      }
    } catch (e) {
      setModal({ isOpen: true, title: 'Error', message: e.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const guardar = async () => {
    try {
      setIsSaving(true);
      const db = getFirestore();
      await setDoc(doc(db, 'config', DOC_ID), config);
      setModal({ isOpen: true, title: 'Éxito', message: 'Configuración guardada correctamente.', type: 'success' });
    } catch (e) {
      setModal({ isOpen: true, title: 'Error', message: e.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const agregarMenu = () => {
    const val = inputs.menu.trim().toUpperCase();
    if (!val) return;
    if (config.menus?.[activeDia]?.includes(val)) {
      setModal({ isOpen: true, title: 'Aviso', message: 'Este menú ya existe para este día.', type: 'info' });
      return;
    }
    setConfig(prev => ({
      ...prev,
      menus: { ...prev.menus, [activeDia]: [...(prev.menus[activeDia] || []), val].sort() }
    }));
    setInputs(prev => ({ ...prev, menu: '' }));
  };

  const eliminarMenu = (dia, item) => {
    setConfig(prev => ({
      ...prev,
      menus: { ...prev.menus, [dia]: prev.menus[dia].filter(x => x !== item) }
    }));
  };

  const agregarGlobal = (campo) => {
    const val = inputs[campo].trim().toUpperCase();
    if (!val) return;
    if (config[campo]?.includes(val)) {
      setModal({ isOpen: true, title: 'Aviso', message: 'Esta opción ya existe.', type: 'info' });
      return;
    }
    setConfig(prev => ({ ...prev, [campo]: [...(prev[campo] || []), val].sort() }));
    setInputs(prev => ({ ...prev, [campo]: '' }));
  };

  const eliminarGlobal = (campo, item) => {
    setConfig(prev => ({ ...prev, [campo]: prev[campo].filter(x => x !== item) }));
  };

  const copyMenuToAllDays = () => {
    const source = config.menus?.[activeDia] || [];
    setConfig(prev => ({
      ...prev,
      menus: Object.fromEntries(DIAS_SEMANA.map(d => [d, [...source]]))
    }));
    setModal({ isOpen: true, title: 'Copiado', message: `Menús de ${activeDia} copiados a todos los días.`, type: 'success' });
  };

  if (isLoading) return <div className="configuracion-loading">Cargando...</div>;

  return (
    <div className="configuracion-opciones">
      <h2>Configuración de Opciones del Menú</h2>
      <p className="instrucciones">
        Definí los menús disponibles por día, los postres y las bebidas.
        En el formulario de pedidos, el usuario elegirá primero el menú, luego el postre y la bebida.
      </p>

      {!readOnly && (
        <button className="guardar-btn" onClick={guardar} disabled={isSaving} style={{ marginBottom: '2rem' }}>
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      )}

      {/* === MENÚS POR DÍA === */}
      <div className="config-section">
        <div className="config-section-header">
          <h3 className="config-section-title">🍽 Menús disponibles</h3>
          {!readOnly && (
            <button className="copy-days-btn" onClick={copyMenuToAllDays} title={`Copiar menús de ${activeDia} a todos los días`}>
              📋 Copiar a todos los días
            </button>
          )}
        </div>

        <div className="dia-tabs">
          {DIAS_SEMANA.map(d => (
            <button
              key={d}
              className={`dia-tab${activeDia === d ? ' active' : ''}`}
              onClick={() => setActiveDia(d)}
            >
              {d}
              <span className="dia-tab-count">{config.menus?.[d]?.length || 0}</span>
            </button>
          ))}
        </div>

        <div className="config-section-body">
          {(!config.menus?.[activeDia]?.length) && (
            <p className="no-items-msg">No hay menús configurados para este día.</p>
          )}
          <div className="chips-container">
            {(config.menus?.[activeDia] || []).map((item, i) => (
              <div key={i} className="chip">
                <span>{item}</span>
                {!readOnly && (
                  <button onClick={() => eliminarMenu(activeDia, item)} className="chip-delete">×</button>
                )}
              </div>
            ))}
          </div>
          {!readOnly && (
            <div className="chip-input-group">
              <input
                type="text"
                value={inputs.menu}
                onChange={e => setInputs(prev => ({ ...prev, menu: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && agregarMenu()}
                placeholder="Nuevo menú (ej: VEGANO)..."
                className="chip-input"
              />
              <button onClick={agregarMenu} className="chip-add-btn">+ Agregar</button>
            </div>
          )}
        </div>
      </div>

      {/* === POSTRES === */}
      <div className="config-section">
        <div className="config-section-header">
          <h3 className="config-section-title">🍮 Postres <span className="global-badge">Global · todos los días</span></h3>
        </div>
        <div className="config-section-body">
          {(!config.postres?.length) && <p className="no-items-msg">No hay postres configurados.</p>}
          <div className="chips-container">
            {(config.postres || []).map((item, i) => (
              <div key={i} className="chip chip-postre">
                <span>{item}</span>
                {!readOnly && (
                  <button onClick={() => eliminarGlobal('postres', item)} className="chip-delete">×</button>
                )}
              </div>
            ))}
          </div>
          {!readOnly && (
            <div className="chip-input-group">
              <input
                type="text"
                value={inputs.postre}
                onChange={e => setInputs(prev => ({ ...prev, postre: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && agregarGlobal('postres')}
                placeholder="Nuevo postre (ej: C/FLAN)..."
                className="chip-input"
              />
              <button onClick={() => agregarGlobal('postres')} className="chip-add-btn">+ Agregar</button>
            </div>
          )}
        </div>
      </div>

      {/* === BEBIDAS === */}
      <div className="config-section">
        <div className="config-section-header">
          <h3 className="config-section-title">🥤 Bebidas <span className="global-badge">Global · todos los días</span></h3>
        </div>
        <div className="config-section-body">
          {(!config.bebidas?.length) && <p className="no-items-msg">No hay bebidas configuradas.</p>}
          <div className="chips-container">
            {(config.bebidas || []).map((item, i) => (
              <div key={i} className="chip chip-bebida">
                <span>{item}</span>
                {!readOnly && (
                  <button onClick={() => eliminarGlobal('bebidas', item)} className="chip-delete">×</button>
                )}
              </div>
            ))}
          </div>
          {!readOnly && (
            <div className="chip-input-group">
              <input
                type="text"
                value={inputs.bebida}
                onChange={e => setInputs(prev => ({ ...prev, bebida: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && agregarGlobal('bebidas')}
                placeholder="Nueva bebida (ej: JUGO NARANJA)..."
                className="chip-input"
              />
              <button onClick={() => agregarGlobal('bebidas')} className="chip-add-btn">+ Agregar</button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
    </div>
  );
};

export default ConfiguracionOpciones;
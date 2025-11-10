import { createContext, useCallback, useContext, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const ConfirmContext = createContext(undefined);

export const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = useState({ open: false, title: '', description: '', confirmText: 'Yes', cancelText: 'Cancel', destructive: false });
  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    const { title = 'Confirm', description = '', confirmText = 'Yes', cancelText = 'Cancel', destructive = false } = options || {};
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({ open: true, title, description, confirmText, cancelText, destructive });
    });
  }, []);

  const handleClose = (result) => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setDialog((d) => ({ ...d, open: false }));
    if (typeof r === 'function') r(result);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {dialog.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{dialog.title}</h3>
            {dialog.description ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{dialog.description}</p> : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                {dialog.cancelText}
              </button>
              <button
                type="button"
                onClick={() => handleClose(true)}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${dialog.destructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
};

ConfirmProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
};

export default ConfirmProvider;

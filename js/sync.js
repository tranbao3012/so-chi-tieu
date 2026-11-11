    syncModule.bindState(
      () => state, 
      (newState) => { 
        state.expenses = newState.expenses || [];
        state.categories = newState.categories || [];
        state.settings = newState.settings || {};
        
        // [FIX] Cập nhật lại mốc thời gian
        if (newState._lastUpdated) {
          state._lastUpdated = newState._lastUpdated;
        }
        
        saveState(); 
        document.dispatchEvent(new CustomEvent('state:changed', { detail: { source: 'sync' } }));
      }
    );

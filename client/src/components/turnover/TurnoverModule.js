import React from 'react';
import GroceryTurnover from './GroceryTurnover';
import DairyTurnover from './DairyTurnover';
import TeaShopTurnover from './TeaShopTurnover';
import HotelTurnover from './HotelTurnover';
import TailoringTurnover from './TailoringTurnover';

function TurnoverModule({ caseData, onSave }) {
  const { businessType } = caseData;

  const props = { caseData, onSave };

  switch (businessType) {
    case 'grocery':   return <GroceryTurnover {...props} />;
    case 'dairy':     return <DairyTurnover {...props} />;
    case 'teaShop':   return <TeaShopTurnover {...props} />;
    case 'hotel':     return <HotelTurnover {...props} />;
    case 'tailoring': return <TailoringTurnover {...props} />;
    default:
      return <div className="alert alert-error">Unknown business type: {businessType}</div>;
  }
}

export default TurnoverModule;

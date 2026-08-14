const phase=(id,productionId,name,type,durationMinutes,resource,dependsOn=[],priority='normal',assigneeId='user-1')=>({id,productionId,name,type,durationMinutes,resource,dependsOn,priority,assigneeId,status:'pending'});

export const DEMO_PRODUCTIONS=Object.freeze([
  {id:'brownies',name:'Brownies',category:'Tortas',yield:{quantity:48,unit:'unidades'},priority:'high'},
  {id:'toffee',name:'Toffee',category:'Cremas',yield:{quantity:1.5,unit:'kg'},priority:'normal'},
  {id:'crema-pastelera',name:'Crema pastelera',category:'Cremas',yield:{quantity:2,unit:'kg'},priority:'high'},
  {id:'blondies',name:'Blondies',category:'Tortas',yield:{quantity:48,unit:'unidades'},priority:'normal'}
]);

export const createDemoProductionPhases=()=>[
  phase('brownies-prepare','brownies','Preparar mezcla de brownies','preparation',25,'worker',[],'high','user-1'),
  phase('brownies-bake','brownies','Hornear brownies','cooking',22,'oven',['brownies-prepare'],'high','user-1'),
  phase('brownies-cool','brownies','Enfriar brownies','cooling',60,'passive',['brownies-bake'],'high','user-1'),
  phase('brownies-decorate','brownies','Decorar brownies','decoration',15,'worker',['brownies-cool'],'high','user-1'),
  phase('brownies-pack','brownies','Empacar brownies','packing',15,'worker',['brownies-decorate'],'high','user-1'),
  phase('toffee-prepare','toffee','Preparar base de toffee','preparation',20,'worker',[],'normal','user-1'),
  phase('toffee-cook','toffee','Cocinar toffee','cooking',20,'stove',['toffee-prepare'],'normal','user-1'),
  phase('toffee-rest','toffee','Dejar reposar el toffee','resting',30,'passive',['toffee-cook'],'normal','user-1'),
  phase('crema-prepare','crema-pastelera','Preparar crema pastelera','preparation',20,'worker',[],'high','user-1'),
  phase('crema-cook','crema-pastelera','Cocinar crema pastelera','cooking',20,'stove',['crema-prepare'],'high','user-1'),
  phase('crema-cool','crema-pastelera','Enfriar crema pastelera','cooling',40,'passive',['crema-cook'],'high','user-1'),
  phase('blondies-prepare','blondies','Preparar mezcla de blondies','preparation',25,'worker',[],'normal','user-1'),
  phase('blondies-bake','blondies','Hornear blondies','cooking',22,'oven',['blondies-prepare'],'normal','user-1'),
  phase('blondies-cool','blondies','Enfriar blondies','cooling',45,'passive',['blondies-bake'],'normal','user-1'),
  phase('blondies-pack','blondies','Porcionar y empacar blondies','packing',20,'worker',['blondies-cool'],'normal','user-1')
];

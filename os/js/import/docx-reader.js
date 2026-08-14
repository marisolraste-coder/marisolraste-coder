const u16=(view,offset)=>view.getUint16(offset,true);
const u32=(view,offset)=>view.getUint32(offset,true);

async function inflate(bytes){
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function unzipEntry(buffer,wantedName){
  const view=new DataView(buffer),bytes=new Uint8Array(buffer);let end=-1;
  for(let i=Math.max(0,bytes.length-65557);i<=bytes.length-22;i++)if(u32(view,i)===0x06054b50)end=i;
  if(end<0)throw new Error('El archivo no tiene una estructura DOCX válida.');
  const entries=u16(view,end+10),centralOffset=u32(view,end+16);let cursor=centralOffset;
  for(let i=0;i<entries;i++){
    if(u32(view,cursor)!==0x02014b50)break;
    const method=u16(view,cursor+10),compressedSize=u32(view,cursor+20),nameLength=u16(view,cursor+28),extraLength=u16(view,cursor+30),commentLength=u16(view,cursor+32),localOffset=u32(view,cursor+42);
    const name=new TextDecoder().decode(bytes.slice(cursor+46,cursor+46+nameLength));
    if(name===wantedName){
      const localNameLength=u16(view,localOffset+26),localExtraLength=u16(view,localOffset+28),start=localOffset+30+localNameLength+localExtraLength,data=bytes.slice(start,start+compressedSize);
      if(method===0)return data;
      if(method===8)return inflate(data);
      throw new Error('El documento usa un método de compresión no compatible.');
    }
    cursor+=46+nameLength+extraLength+commentLength;
  }
  throw new Error('No encontramos el contenido principal dentro del documento.');
}

export async function readDocx(file){
  if(!file?.name?.toLowerCase().endsWith('.docx'))throw new Error('Selecciona un archivo con extensión .docx.');
  if(file.size>15*1024*1024)throw new Error('El documento supera el límite temporal de 15 MB.');
  const xmlBytes=await unzipEntry(await file.arrayBuffer(),'word/document.xml');
  const xml=new TextDecoder('utf-8').decode(xmlBytes),documentXml=new DOMParser().parseFromString(xml,'application/xml');
  if(documentXml.querySelector('parsererror'))throw new Error('No pudimos leer la estructura interna del documento.');
  let gapBefore=false,order=0;const blocks=[];
  for(const paragraph of [...documentXml.getElementsByTagNameNS('*','p')]){
    const text=[...paragraph.getElementsByTagNameNS('*','t')].map(node=>node.textContent).join('').replace(/\s+/g,' ').trim();
    const style=paragraph.getElementsByTagNameNS('*','pStyle')[0]?.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main','val')||paragraph.getElementsByTagNameNS('*','pStyle')[0]?.getAttribute('w:val')||'';
    if(!text){gapBefore=true;continue}
    const bold=paragraph.getElementsByTagNameNS('*','b').length>0,underline=paragraph.getElementsByTagNameNS('*','u').length>0;
    const numPr=paragraph.getElementsByTagNameNS('*','numPr')[0],listLevel=Number(numPr?.getElementsByTagNameNS('*','ilvl')[0]?.getAttribute('w:val')||0);
    blocks.push({id:`block-${order+1}`,order:order++,type:numPr||/list/i.test(style)?'list-item':'paragraph',text,rawText:text,style,bold,underline,listLevel:numPr?listLevel:undefined,gapBefore});gapBefore=false;
  }
  if(!blocks.length)throw new Error('El documento no contiene texto que podamos analizar.');
  return blocks;
}

/** Video FAQ mock — only miniProgramSearch=true items reach mini list API */

export interface VideoFaqItem {
  id: string
  keywords: string
  title: string
  summary: string
  videoPath?: string
  playUrl?: string
  miniProgramSearch?: boolean
}

export const mockVideoFaqList: VideoFaqItem[] = [
  {
    id: 'v1',
    keywords: '配电增容 周期 业主书面',
    title: '厂房配电增容一般多久？需要业主出具什么？',
    summary: '报装流程、典型周期、书面清单模板。',
    miniProgramSearch: true,
  },
  {
    id: 'v2',
    keywords: '独门独院 环评 沟通',
    title: '独门独院与环评等级不匹配时如何管理客户预期？',
    summary: '替代方案、园区背书、书面免责口径。',
    miniProgramSearch: true,
  },
  {
    id: 'v3',
    keywords: '土地 亩 容积率 举例',
    title: '工业用地亩数与报建容积率怎么给客户举例？',
    summary: '图示推演、常见误区、引用当地公开案例。',
    miniProgramSearch: false,
  },
]

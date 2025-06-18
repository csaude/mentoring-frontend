import { boot } from 'quasar/wrappers'
import EditableTablePlugin from 'src/plugins/editable-table'

export default boot(({ app }) => {
  app.use(EditableTablePlugin)
})

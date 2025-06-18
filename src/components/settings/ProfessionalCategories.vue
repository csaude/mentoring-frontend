<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useProfessionalCategoryStore } from 'src/stores/professionalCategory/ProfessionalCategoryStore'
import { useApiErrorHandler } from '../../composables/shared/error/useApiErrorHandler'
import { useSwal } from 'src/composables/shared/dialog/dialog'

const { alertError, alertWarningAction } = useSwal()
const { handleApiError } = useApiErrorHandler()

const categoryStore = useProfessionalCategoryStore()

const nameFilter = ref('')

const categories = computed({
  get: () => categoryStore.currentPageCategories,
  set: (val) => {
    categoryStore.categoriesPages[categoryStore.pagination.currentPage] = val
    categoryStore.currentPageCategories = val
  }
})

const columns = [
  { name: 'description', label: 'Descrição', align: 'left', field: 'description', style: 'width: 70%; white-space: normal; word-break: break-word;' },
  { name: 'actions', label: 'Acções', align: 'center', style: 'width: 120px;' }
]

onMounted(async () => {
  await loadCategories(0, pagination.value.rowsPerPage)
})

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const previousRowsPerPage = ref(pagination.value.rowsPerPage)

const loadCategories = async (page: number, size: number) => {
  await categoryStore.fetchCategories({
    page,
    size,
    name: nameFilter.value,
    ignoreCache: false
  })

  pagination.value.rowsNumber = categoryStore.pagination.totalSize
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const rowsPerPageChanged = rowsPerPage !== previousRowsPerPage.value

  if (rowsPerPageChanged) {
    categoryStore.categoriesPages = {}
    categoryStore.currentPageCategories = []
    console.log('[onRequest] RowsPerPage changed → Clearing store cache')
  }

  previousRowsPerPage.value = rowsPerPage

  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  const apiPage = page - 1

  await loadCategories(apiPage, rowsPerPage)
}

const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1
  await loadCategories(0, pagination.value.rowsPerPage)
}

const saveCategoryHandler = async (categoryData: any) => {
  try {
    const payloadToSave = { ...categoryData }
    delete payloadToSave.undefined
    delete payloadToSave._backup

    const saved = await categoryStore.saveCategory(payloadToSave)
    return saved
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar categoria profissional')
    throw err
  }
}

const deleteCategoryHandler = async (uuid: string) => {
  try {
    await categoryStore.deleteCategory(uuid)
  } catch (err: any) {
    handleApiError(err, 'Erro ao apagar categoria profissional')
    throw err
  }
}

const toggleStatusHandler = async (row: any) => {
  try {
    const novoStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const confirm = await alertWarningAction(
      `Deseja realmente ${novoStatus === 'ACTIVE' ? 'ativar' : 'desativar'} esta categoria profissional?`
    )

    if (!confirm) return

    const updated = await categoryStore.updateCategoryLifeCycleStatus(row.uuid, novoStatus)
    row.lifeCycleStatus = updated.lifeCycleStatus
  } catch (err: any) {
    handleApiError(err, 'Erro ao atualizar estado da categoria profissional')
  }
}
</script>

<template>
  <EditableTable
    v-model="categories"
    title="Categorias Profissionais"
    :columns="columns"
    :loading="categoryStore.loading"
    v-model:pagination="pagination"
    :rows-per-page-options="[10, 20, 50, 100]"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    @save="(row, { resolve, reject }) => saveCategoryHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteCategoryHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
    @request="onRequest"
  />
</template>

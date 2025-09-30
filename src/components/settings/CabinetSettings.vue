<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useCabinetStore } from 'src/stores/cabinet/CabinetStore'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import { useSwal } from 'src/composables/shared/dialog/dialog'

const { alertError, alertWarningAction } = useSwal()
const { handleApiError } = useApiErrorHandler()

const cabinetStore = useCabinetStore()
const nameFilter = ref('')

const cabinets = computed({
  get: () => cabinetStore.currentPageCabinets,
  set: (val) => {
    cabinetStore.cabinetsPages[cabinetStore.pagination.currentPage] = val
    cabinetStore.currentPageCabinets = val
  }
})

const columns = [
  { name: 'name', label: 'Nome', align: 'left', field: 'name', style: 'width: 70%; white-space: normal; word-break: break-word;' },
  { name: 'actions', label: 'Acções', align: 'center', style: 'width: 120px;' }
]

onMounted(async () => {
  await loadCabinets(0, pagination.value.rowsPerPage)
})

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const previousRowsPerPage = ref(pagination.value.rowsPerPage)

const loadCabinets = async (page: number, size: number) => {
  await cabinetStore.fetchCabinets({
    page,
    size,
    name: nameFilter.value,
    ignoreCache: false
  })
  pagination.value.rowsNumber = cabinetStore.pagination.totalSize
}

const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const rowsPerPageChanged = rowsPerPage !== previousRowsPerPage.value

  if (rowsPerPageChanged) {
    cabinetStore.cabinetsPages = {}
    cabinetStore.currentPageCabinets = []
    console.log('[onRequest] RowsPerPage changed → Clearing store cache')
  }

  previousRowsPerPage.value = rowsPerPage

  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  const apiPage = page - 1
  await loadCabinets(apiPage, rowsPerPage)
}

const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1
  await loadCabinets(0, pagination.value.rowsPerPage)
}

const saveCabinetHandler = async (cabinetData: any) => {
  try {
    return await cabinetStore.saveCabinet(cabinetData)
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar sector')
    throw err
  }
}

const deleteCabinetHandler = async (uuid: string) => {
  try {
    await cabinetStore.deleteCabinet(uuid)
  } catch (err: any) {
    handleApiError(err, 'Erro ao apagar sector')
    throw err
  }
}

const toggleStatusHandler = async (row: any) => {
  try {
    const novoStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const confirm = await alertWarningAction(
      `Deseja realmente ${novoStatus === 'ACTIVE' ? 'ativar' : 'desativar'} este sector?`
    )
    if (!confirm) return

    const updated = await cabinetStore.updateCabinetLifeCycleStatus(row.uuid, novoStatus)
    row.lifeCycleStatus = updated.lifeCycleStatus
  } catch (err: any) {
    handleApiError(err, 'Erro ao atualizar estado do sector')
  }
}
</script>

<template>
  <EditableTable
    v-model="cabinets"
    title="Sectores"
    :columns="columns"
    :loading="cabinetStore.loading"
    v-model:pagination="pagination"
    :rows-per-page-options="[10, 20, 50, 100]"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    @save="(row, { resolve, reject }) => saveCabinetHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteCabinetHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
    @request="onRequest"
  />
</template>

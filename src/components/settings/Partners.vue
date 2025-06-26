<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { usePartnerStore } from 'src/stores/partner/PartnerStore'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import { useSwal } from 'src/composables/shared/dialog/dialog'

const { alertError, alertWarningAction } = useSwal()
const { handleApiError } = useApiErrorHandler()

const partnerStore = usePartnerStore()

const nameFilter = ref('')

const partners = computed({
  get: () => partnerStore.currentPagePartners,
  set: (val) => {
    partnerStore.partnersPages[partnerStore.pagination.currentPage] = val
    partnerStore.currentPagePartners = val
  }
})

const columns = [
  { name: 'name', label: 'Nome', align: 'left', field: 'name', style: 'width: 35%' },
  { name: 'description', label: 'Descrição', align: 'left', field: 'description', style: 'width: 55%' },
  { name: 'actions', label: 'Ações', align: 'center', style: 'width: 120px;' }
]

onMounted(async () => {
  await loadPartners(0, pagination.value.rowsPerPage)
})

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const previousRowsPerPage = ref(pagination.value.rowsPerPage)

const loadPartners = async (page: number, size: number) => {
  await partnerStore.fetchPartners({
    page,
    size,
    name: nameFilter.value,
    ignoreCache: false
  })

  pagination.value.rowsNumber = partnerStore.pagination.totalSize
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const rowsPerPageChanged = rowsPerPage !== previousRowsPerPage.value

  if (rowsPerPageChanged) {
    partnerStore.partnersPages = {}
    partnerStore.currentPagePartners = []
    console.log('[onRequest] RowsPerPage changed → Clearing store cache')
  }

  previousRowsPerPage.value = rowsPerPage

  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  const apiPage = page - 1

  await loadPartners(apiPage, rowsPerPage)
}

const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1
  await loadPartners(0, pagination.value.rowsPerPage)
}

const savePartnerHandler = async (partnerData: any) => {
  try {
    const payloadToSave = { ...partnerData }
    delete payloadToSave._backup
    delete payloadToSave.undefined

    const saved = await partnerStore.savePartner(payloadToSave)
    return saved
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar parceiro')
    throw err
  }
}

const deletePartnerHandler = async (uuid: string) => {
  try {
    await partnerStore.deletePartner(uuid)
  } catch (err: any) {
    handleApiError(err, 'Erro ao apagar parceiro')
    throw err
  }
}

const toggleStatusHandler = async (row: any) => {
  try {
    const novoStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const confirm = await alertWarningAction(
      `Deseja realmente ${novoStatus === 'ACTIVE' ? 'ativar' : 'desativar'} este parceiro?`
    )

    if (!confirm) return

    const updated = await partnerStore.updatePartnerLifeCycleStatus(row.uuid, novoStatus)
    row.lifeCycleStatus = updated.lifeCycleStatus
  } catch (err: any) {
    handleApiError(err, 'Erro ao atualizar estado do parceiro')
  }
}
</script>

<template>
  <EditableTable
    v-model="partners"
    title="Instituições"
    :columns="columns"
    :loading="partnerStore.loading"
    v-model:pagination="pagination"
    :rows-per-page-options="[10, 20, 50, 100]"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    @save="(row, { resolve, reject }) => savePartnerHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deletePartnerHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
    @request="onRequest"
  />
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { Loading, QSpinnerRings } from 'quasar'
import { useHealthFacilityStore } from 'src/stores/healthFacility/HealthFacilityStore'
import { useProvinceStore } from 'src/stores/province/ProvinceStore'
import { useDistrictStore } from 'src/stores/district/DistrictStore'
import { useSwal } from 'src/composables/shared/dialog/dialog'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'

const { alertError, alertWarningAction } = useSwal()
const { handleApiError } = useApiErrorHandler()

const healthFacilityStore = useHealthFacilityStore()
const provinceStore = useProvinceStore()
const districtStore = useDistrictStore()

const nameFilter = ref('')

const healthFacilities = computed({
  get: () => healthFacilityStore.currentPageHealthFacilities,
  set: (val) => {
    healthFacilityStore.healthFacilityPages[healthFacilityStore.pagination.currentPage] = val
    healthFacilityStore.currentPageHealthFacilities = val
  }
})

const provinceOptions = computed(() =>
  provinceStore.currentPageProvinces.map(p => ({
    label: p.designation,
    value: p.id
  }))
)

const districtOptions = computed(() =>
  districtStore.getAllDistrictsAcrossPages().map(d => ({
    label: d.description,
    value: d.id,
    provinceId: d.province?.id
  }))
)


const columns = [
  {
    name: 'healthFacility',
    label: 'Nome da Unidade Sanitária',
    field: 'healthFacility',
    align: 'left',
    style: 'width: 40%'
  },
  {
    name: 'provinceId',
    label: 'Província',
    field: 'provinceId',
    align: 'left'
  },
  {
    name: 'districtId',
    label: 'Distrito',
    field: 'districtId',
    align: 'left'
  },
  {
    name: 'actions',
    label: 'Ações',
    align: 'center',
    style: 'width: 120px'
  }
]

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const previousRowsPerPage = ref(pagination.value.rowsPerPage)

onMounted(async () => {
  await provinceStore.fetchProvinces()
  await districtStore.fetchDistricts()
  await loadHealthFacilities(0, pagination.value.rowsPerPage)
})

watch(
  () => healthFacilityStore.loading,
  (val) => {
    if (val) {
      Loading.show({ spinner: QSpinnerRings, message: 'A carregar unidades sanitárias...' })
    } else {
      Loading.hide()
    }
  },
  { immediate: true }
)

const loadHealthFacilities = async (page: number, size: number) => {
  await healthFacilityStore.fetchHealthFacilities({
    page,
    size,
    name: nameFilter.value,
    ignoreCache: false
  })

  pagination.value.rowsNumber = healthFacilityStore.pagination.totalSize
}

const onRequest = async ({ pagination: p }) => {
  const { page, rowsPerPage, sortBy, descending } = p
  const rowsPerPageChanged = rowsPerPage !== previousRowsPerPage.value

  if (rowsPerPageChanged) {
    healthFacilityStore.healthFacilityPages = {}
    healthFacilityStore.currentPageHealthFacilities = []
  }

  previousRowsPerPage.value = rowsPerPage
  Object.assign(pagination.value, { page, rowsPerPage, sortBy, descending })

  await loadHealthFacilities(page - 1, rowsPerPage)
}

const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1
  await loadHealthFacilities(0, pagination.value.rowsPerPage)
}


const saveHandler = async (data: any) => {
  try {
    delete data._backup
    delete data.undefined

    // 🔁 Define o objeto `district` completo usando o `districtId`
    if (data.districtId) {
      const district = districtStore.getAllDistrictsAcrossPages().find(
        d => d.id === data.districtId
      )
      if (district) {
        data.district = district
      }
    }
    return await healthFacilityStore.saveHealthFacility(data)
  } catch (err) {
    handleApiError(err, 'Erro ao salvar unidade sanitária')
    throw err
  }
}


const deleteHandler = async (uuid: string) => {
  try {
    await healthFacilityStore.deleteHealthFacility(uuid)
  } catch (err) {
    handleApiError(err, 'Erro ao apagar unidade sanitária')
    throw err
  }
}

const toggleStatusHandler = async (row: any) => {
  try {
    const novoStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const confirm = await alertWarningAction(
      `Deseja realmente ${novoStatus === 'ACTIVE' ? 'ativar' : 'desativar'} esta unidade sanitária?`
    )
    if (!confirm) return

    const updated = await healthFacilityStore.updateHealthFacilityLifeCycleStatus(row.uuid, novoStatus)
    row.lifeCycleStatus = updated.lifeCycleStatus
  } catch (err) {
    handleApiError(err, 'Erro ao atualizar status da unidade sanitária')
  }
}
</script>

<template>
  <EditableTable
    v-model="healthFacilities"
    title="Unidades Sanitárias"
    :columns="columns"
    :loading="healthFacilityStore.loading"
    v-model:pagination="pagination"
    :rows-per-page-options="[10, 20, 50, 100]"
    :province-options="provinceOptions"
    :district-options="districtOptions"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    @save="(row, { resolve, reject }) => saveHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
    @request="onRequest"
  />
</template>

import { ref, computed, onMounted, watch } from 'vue'
import { useProvinceStore } from 'src/stores/province/ProvinceStore'
import { useDistrictStore } from 'src/stores/district/DistrictStore'

interface UseLocationFieldOptions {
  provinceId?: any
  districtId?: any
  useReset?: boolean // se deve limpar distrito ao mudar província
}

export function useLocationField(options: UseLocationFieldOptions = {}) {
  const provinceStore = useProvinceStore()
  const districtStore = useDistrictStore()

  const { provinceId, districtId, useReset = true } = options

  const loadLocations = async () => {
    if (provinceStore.currentPageProvinces.length === 0) {
      await provinceStore.fetchProvinces()
    }

    if (districtStore.currentPageDistricts.length === 0) {
      await districtStore.fetchDistricts()
    }
  }

  const provinceOptions = computed(() =>
    provinceStore.currentPageProvinces.map(p => ({
      label: p.designation,
      value: p.id
    }))
  )

  const districtOptions = computed(() =>
    districtStore.currentPageDistricts.map(d => ({
      label: d.description,
      value: d.id,
      provinceId: d.province?.id
    }))
  )

  const filteredDistrictOptions = computed(() => {
    if (!provinceId?.value) return []
    return districtOptions.value.filter(d => d.provinceId === provinceId.value)
  })

  if (useReset && provinceId && districtId) {
    watch(provinceId, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        districtId.value = null
      }
    })
  }

  onMounted(loadLocations)

  return {
    loadLocations,
    provinceOptions,
    districtOptions,
    filteredDistrictOptions
  }
}

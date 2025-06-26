<template>
  <div style="height: 100%;">
    <search 
      v-if="isSearchStep" 
      @create="setStep('create')" 
      @edit="edit" 
      @goToMentoringAreas="goToMentoringAreas" 
      @import="setStep('import')"
    />
    <import-mentor 
      v-if="isImportStep" 
      @close="close" 
    />
    <add-edit 
      v-if="isCreateStep || isEditStep" 
      @goToMentoringAreas="goToMentoringAreas" 
      @close="close" 
    />
    <manage-mentoring-areas 
      v-if="isEditAreasStep" 
      @close="close" 
    />
  </div>
</template>

<script setup>
// Vue
import { ref, provide, computed, onMounted } from 'vue'

// Composables
import { useLoading } from 'src/composables/shared/loading/loading'

// Components
import Search from 'src/components/Mentors/Search.vue'
import ImportMentor from 'src/components/Mentors/ImportMentor.vue'
import AddEdit from 'src/components/Mentors/AddEditMentor.vue'
import ManageMentoringAreas from 'src/components/Mentors/ManageMentoringAreas.vue'

// Services

import programmaticAreaService from 'src/services/api/programmaticArea/programmaticAreaService'

// Stores
import { useProvinceStore } from 'src/stores/province/ProvinceStore'
import { useDistrictStore } from 'src/stores/district/DistrictStore'
import { useHealthFacilityStore } from 'src/stores/healthFacility/HealthFacilityStore'
import { useProfessionalCategoryStore } from 'src/stores/professionalCategory/ProfessionalCategoryStore'
import { usePartnerStore } from 'src/stores/partner/PartnerStore'

// Chaves para provide/inject
const STEP_KEY = 'step'
const SELECTED_MENTOR_KEY = 'selectedMentor'

// Refs
const step = ref('')
const selectedMentor = ref(null)

// Stores
const provinceStore = useProvinceStore()
const districtStore = useDistrictStore()
const healthFacilityStore = useHealthFacilityStore()
const professionalCategoryStore = useProfessionalCategoryStore()
const partnerStore = usePartnerStore()

// Loading
const { closeLoading, showloading } = useLoading()

// Computeds de etapa
const isSearchStep = computed(() => step.value === 'search')
const isCreateStep = computed(() => step.value === 'create')
const isImportStep = computed(() => step.value === 'import')
const isEditStep = computed(() => step.value === 'edit')
const isEditAreasStep = computed(() => step.value === 'editAreas')

// Funções de navegação
const setStep = (value) => {
  step.value = value
}

const goToMentoringAreas = (mentor) => {
  selectedMentor.value = mentor
  setStep('editAreas')
}

const edit = (mentor) => {
  selectedMentor.value = mentor;
  setStep('edit');
};

const close = () => {
  setStep('search')
}

// Inicialização
const init = async () => {
  try {
    await Promise.all([
      districtStore.fetchDistricts(),
      programmaticAreaService.getAll(),
      provinceStore.fetchProvinces(),
      professionalCategoryStore.fetchCategories(),
      partnerStore.fetchPartners()
    ])
  } finally {
    closeLoading()
  }
}

onMounted(() => {
  showloading()
  setStep('search')
  init()
})

// Provide
provide(STEP_KEY, step)
provide(SELECTED_MENTOR_KEY, selectedMentor)
</script>

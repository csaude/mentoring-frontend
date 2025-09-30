<template>
  <div style="height: 100%">
    <!-- Show the Search component when in the 'search' step -->
    <search
      v-if="isSearchStep"
      @create="changeToCreateStep"
      @edit="changeToEditStep"
      @goToForms="goToForms"
    />

    <!-- Show the AddEdit (ManageForm) component when in the 'create' step -->
    <add-edit v-if="isEditOrCreate" @goToForms="goToForms" @close="close" />
  </div>
</template>

<script setup>
import { ref, provide, watch, onMounted } from 'vue';
import Search from 'src/components/Forms/Search.vue';
import AddEdit from 'src/components/Forms/ManageForm.vue'; // ManageForm.vue referenced as AddEdit
import { useLoading } from 'src/composables/shared/loading/loading';
import programService from 'src/services/api/program/programService';
import programmaticAreaService from 'src/services/api/programmaticArea/programmaticAreaService';
import responseTypeService from 'src/services/api/question/responseTypeService';
import evaluationTypeService from 'src/services/api/question/evaluationTypeService';
import evaluationLocationService from 'src/services/api/question/evaluationLocationService';
import sectionService from 'src/services/api/section/sectionService';
import useStepManager from 'src/composables/shared/systemUtils/useStepManager';
import Form from 'stores/model/form/Form';

const { closeLoading, showloading } = useLoading();
const step = ref('search'); // Track the current step ('search' or 'create')
const selectedForm = ref(null); // Hold the selected form for editing
const form = ref(
  new Form({
    programmaticArea: {
      program: {
        id: null,
        name: null,
      },
    },
    code: '',
    name: '',
    description: '',
    targetPatient: '',
    targetFile: '',
    formSections: [],
    formQuestions: [],
  })
);

// Using useStepManager to manage steps
const {
  isSearchStep,
  isEditOrCreate,
  changeToCreateStep,
  changeToEditStep,
  changeToSearchStep,
  printCurrentStep,
} = useStepManager(step);

// Run this when the component is mounted
onMounted(() => {
  showloading(); // Show loading spinner while initializing
  changeToSearchStep();
  init(); // Initialize data (load services)
  printCurrentStep();
});

// When an existing form is selected, go to the edit step
const goToForms = (form) => {
  printCurrentStep();
  selectedForm.value = form;
  //changeToEditStep();  // Now transitioning to the edit step
};

// Initialize all the necessary services (programs, areas, sections, etc.)
const init = async () => {
  try {
    await Promise.all([
      programService.getAll(),
      programmaticAreaService.getAll(),
      sectionService.getAllSections(),
      responseTypeService.getAll(),
      evaluationTypeService.getAll(),
      evaluationLocationService.getAll(),
    ]);
  } catch (error) {
    console.error('Error initializing form data:', error);
  } finally {
    closeLoading(); // Hide loading spinner
  }
};

// Watch for changes in 'step' and reset 'form' when it changes to 'create'
watch(step, (newStep) => {
  if (newStep === 'create') {
    form.value = new Form({
      programmaticArea: {
        program: {
          id: null,
          name: null,
        },
      },
      code: '',
      name: '',
      description: '',
      targetPatient: '',
      targetFile: '',
      formSections: [],
      formQuestions: [],
    });
  }
});

// Close the form and go back to the search step
const close = () => {
  changeToSearchStep();
};

// Provide the step, selectedForm, and isNewForm to child components
provide('step', step);
provide('selectedForm', selectedForm);
provide('form', form);
</script>

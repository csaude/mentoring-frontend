<template>
  <div style="height: 100%;">
    <search-rondas v-if="isSearchStep" @create="changeStep('create')" @edit="edit" @goToMentoringAreas="goToMentoringAreas" @import="changeStep('import')"/>
  </div>
</template>

<script setup>
  import SearchRondas from 'components/rondas/SearchRondas.vue';
  import {computed, onMounted, ref} from 'vue';
  import districtService from 'src/services/api/district/districtService';
  import healthFacilityService from 'src/services/api/healthfacility/healthFacilityService';
  import professionalCategoryService from 'src/services/api/professionalcategory/professionalCategoryService';
  import partnerService from 'src/services/api/partner/partnerService';
  import programService from 'src/services/api/program/programService';
  import programmaticAreaService from 'src/services/api/programmaticArea/programmaticAreaService';
  import mentorService from "src/services/api/mentor/mentorService";
  import {useLoading} from 'src/composables/shared/loading/loading';
  import UsersService from "src/services/api/user/UsersService";
  import rondaService from "src/services/api/ronda/rondaService";

  const isSearchStep = ref(true)
  const { closeLoading, showloading } = useLoading();


  const init = async () => {
    await search()
    await districtService.getAll()
    await healthFacilityService.getAll()
    await rondaService.getAllRondaType()
    await rondaService.getAll()
    closeLoading();
  }

  const search = () => {
    const params = {
      userId: currUser.value.id,
      name: '',
      phoneNumber: '',
      nuit: '',
    }
    Object.keys(params).forEach( (key) => (params[key] === '') && delete params[key]);

    mentorService.search(params).then((response) => {
      // console.log(response)
    }).catch((error) => {
      console.error(error);
    });
  };

  const currUser = computed(() => {
    return UsersService.getLogedUser();
  });

  onMounted(() => {
    showloading()
    init();
  });
</script>

<style scoped lang="scss">

</style>

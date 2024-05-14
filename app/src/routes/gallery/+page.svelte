<script lang="ts">
  import { getContext } from "svelte"
  import { type AppClient } from "../../api/appClient";
  import { type NotificationCTX } from "$lib/components/RequestNotifications/context";
  import Modal from "$lib/components/Modal.svelte"
  import FileUpload from "$lib/components/FileUpload.svelte"
  import ImageEditor from "../../components/ImageEditor.svelte";

  const http = getContext<AppClient>('client')
  const notifications = getContext<NotificationCTX>('notifications')

  type Metadata = NonNullable<Awaited<ReturnType<typeof http.api.files.get>>['data']>[0]
  let files: Metadata[] = []

  const deleteFile = (id: string) => {
    files = files.filter(file => file.id !== id)
  }

  const updateFile = (updated: Metadata) => {
    files = files.map(file => file.id === updated.id ? updated : file)
  }

  let name = ""
  let limit = "15"
  let uploadOpen = false

  const getFiles = async () => {
    const response = await http.api.files.get({ query: { name, limit } }).catch(notifications.warn)
    if (!response || !response.data)
      return

    files = response.data
  } 
  
  const getPresignedUrl = async (file: File) => {
    const response = await http.api.files.post({
      filename: file.name, type: file.type, folder: "images"
    }).catch(notifications.warn)
    if (!response || !response.data) return null
    return { url: response.data.url, id: response.data.metadata.id }
  }
</script>

<main class="p-6">
  <div class="flex justify-between items-center">
    <div>
      <button class="mt-4 btn btn-info" on:click={() => uploadOpen = true}>Upload</button>
    </div>
    <div>
      <input class="input input-bordered" type="text" placeholder="Name" bind:value={name}>
      <input class="input input-bordered" type="text" placeholder="Limit" bind:value={limit}>
      <button class="mt-4 btn btn-info" on:click={getFiles}>Search</button>
    </div>
  </div>

  <div class="divider">Images</div>
  
  <div class="grid grid-cols-3cols gap-4">
    {#each files as file (file.id)}
      <ImageEditor metadata={file} on:update={e => updateFile(e.detail)} on:delete={e => deleteFile(e.detail.id)} />
    {/each}
  </div>

  {#if uploadOpen}
  <Modal on:clickOut={() => uploadOpen = false}>
    <div class="w-[400px]">
      <FileUpload getUrl={getPresignedUrl} />
    </div>
  </Modal>
  {/if}
</main>
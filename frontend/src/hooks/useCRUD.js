import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';

/**
 * Hook personnalisé pour gérer les opérations CRUD avec pagination
 */
export const useCRUD = (entityName, endpoint) => {
  const queryClient = useQueryClient();

  // Récupérer les données paginées
  const useList = (page = 0, pageSize = 10, filters = {}) => {
    const filterParams = new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
    ).toString();

    const url = `${endpoint}?page=${page}&size=${pageSize}${filterParams ? '&' + filterParams : ''}`;

    return useQuery({
      queryKey: [entityName, page, pageSize, filters],
      queryFn: async () => {
        const res = await api.get(url);
        return res.data;
      },
      staleTime: 5 * 60 * 1000 // 5 min
    });
  };

  // Récupérer un élément unique
  const useDetail = (id) => {
    return useQuery({
      queryKey: [entityName, id],
      queryFn: async () => {
        if (!id) return null;
        const res = await api.get(`${endpoint}/${id}`);
        return res.data;
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000
    });
  };

  // Créer
  const useCreate = () => {
    return useMutation({
      mutationFn: async (data) => {
        const res = await api.post(endpoint, data);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries([entityName]);
        toast.success(`${entityName} créé avec succès`);
      },
      onError: (error) => {
        toast.error(`Erreur lors de la création: ${error.message}`);
      }
    });
  };

  // Modifier
  const useUpdate = () => {
    return useMutation({
      mutationFn: async ({ id, data }) => {
        const res = await api.put(`${endpoint}/${id}`, data);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries([entityName]);
        toast.success(`${entityName} modifié avec succès`);
      },
      onError: (error) => {
        toast.error(`Erreur lors de la modification: ${error.message}`);
      }
    });
  };

  // Supprimer
  const useDelete = () => {
    return useMutation({
      mutationFn: async (id) => {
        await api.delete(`${endpoint}/${id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries([entityName]);
        toast.success(`${entityName} supprimé avec succès`);
      },
      onError: (error) => {
        toast.error(`Erreur lors de la suppression: ${error.message}`);
      }
    });
  };

  return {
    useList,
    useDetail,
    useCreate,
    useUpdate,
    useDelete,
    invalidate: () => queryClient.invalidateQueries([entityName])
  };
};

export default useCRUD;

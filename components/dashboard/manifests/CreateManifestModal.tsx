"use client";

import { useState } from "react";
import { Layers } from "lucide-react";

import GlassEffectCard from "@/components/commons/GlassEffectCard";
import ActionBtn from "@/components/commons/ActionButton";
import EntityPicker from "@/components/commons/EntityPicker";
import { ICreateManifest } from "@/types/manifest";

import { listBranches } from "@/services/BranchService";

interface CreateManifestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ICreateManifest) => Promise<void>;
    loading?: boolean;
}

export default function CreateManifestModal({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
}: CreateManifestModalProps) {
    const [toNodeId, setToNodeId] = useState<string | null>(null);

    const [branchSearch, setBranchSearch] = useState("");

    const reset = () => {
        setToNodeId(null);
        setBranchSearch("");
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        if (!toNodeId) return;

        await onSubmit({
            toNodeId,
        });

        reset();
    };

    const isValid = !!toNodeId;

    return (
        <div>
            <GlassEffectCard
                isOpen={isOpen}
                onClose={handleClose}
                title="New Manifest"
                subtitle="Dispatch shipments to a destination node"
                headerIcon={<Layers size={17} style={{ color: "#fbbf24" }} />}
                showCloseButton
                accentColor="amber"
                withNoise
                withSweep
                footer={
                    <>
                        <ActionBtn
                            onClick={handleClose}
                            title="Cancel"
                            label="Cancel"
                            variant="slate"
                            size="action"
                            className="w-fit text-sm! font-medium! capitalize px-4 py-2 text-text-secondary"
                            disabled={loading}
                        />

                        <ActionBtn
                            onClick={handleSubmit}
                            title="Create Manifest"
                            label={loading ? "Creating..." : "Create Manifest"}
                            variant="emerald"
                            size="action"
                            disabled={!isValid || loading}
                        />
                    </>
                }
            >
                <div className="space-y-5 p-1">
                    {/* Destination Branch */}
                    <div className="relative z-9999">
                        <EntityPicker<{ id: string; name: string }>
                            value={toNodeId}
                            onChange={(id) => setToNodeId(id)}
                            onSearchChange={setBranchSearch}
                            fetchData={async () =>
                                (
                                    await listBranches({
                                        pageNumber: 1,
                                        pageSize: 20,
                                        search: branchSearch,
                                    })
                                ).items
                            }
                            getId={(branch) => branch.id}
                            getLabel={(branch) => branch.name}
                            getSubLabel={(branch) => branch.id.slice(0, 12)}
                            renderIcon={() => (
                                <div className="w-6 h-6 rounded-full bg-amber-400/10 flex items-center justify-center">
                                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                            )}

                            label="Destination Node *"
                            placeholder="Search destination node..."
                            required
                        />
                    </div>
                </div>
            </GlassEffectCard>
        </div>
    );
}